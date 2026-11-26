let todos = [
    { id: "1", text: "Task X", hours: 1, completed: false },
    { id: "2", text: "Task Y", hours: 2.5, completed: true },
    { id: "3", text: "Task Z", hours: 6, completed: false }
];

let currentFilter = "all";

const list = document.getElementById("todo-list");
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const hoursInput = document.getElementById("hours-input");
const countEl = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const toggleAllBtn = document.getElementById("toggle-all");
const filterButtons = document.querySelectorAll(".filter");

function getDifficulty(hours) {
    if (hours <= 2) {
        return "Easy";
    } else if (hours <= 5) {
        return "Medium";
    } else {
        return "Hard";
    }
}

function parseHours(value) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function addTodo(text, hours) {
    const newTodo = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        text,
        hours,
        completed: false
    };
    todos.push(newTodo);
    render();
}

function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const hours = typeof todo.hours === "number" ? todo.hours : 0;
    const difficulty = getDifficulty(hours);
    const label = document.createElement("span");
    label.classList.add("difficulty", `difficulty-${difficulty.toLowerCase()}`);
    label.textContent = `${difficulty} · ${hours}h`;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "x";

    li.append(checkbox, text, label, del);
    return li;
}

function totalHoursLeft() {
    let total = 0;
    for (const todo of todos) {
        if (!todo.completed && typeof todo.hours === "number") {
            total += todo.hours;
        }
    }
    return total;
}

function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    render();
}

function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    render();
}

function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
    render();
}

function toggleAll() {
    const allDone = todos.length > 0 && todos.every((t) => t.completed);
    todos.forEach((t) => (t.completed = !allDone));
    render();
}

function visibleTodos() {
    if (currentFilter === "active") return todos.filter((t) => !t.completed);
    if (currentFilter === "completed") return todos.filter((t) => t.completed);
    return todos;
}

function render() {
    const items = visibleTodos();
    list.replaceChildren(...items.map(createTodoElement));

    const remaining = todos.filter((todo) => !todo.completed).length;
    const hoursLeft = totalHoursLeft();
    countEl.textContent = `You have ${remaining} task(s) left, totaling ${hoursLeft} hour(s).`;

    const hasCompleted = todos.some((todo) => todo.completed);
    clearCompletedBtn.hidden = !hasCompleted;

    toggleAllBtn.hidden = todos.length === 0;
    toggleAllBtn.textContent =
        todos.length > 0 && todos.every((t) => t.completed)
            ? "Mark all active"
            : "Mark all done";

    filterButtons.forEach((btn) => {
        const active = btn.dataset.filter === currentFilter;
        btn.classList.toggle("active", active);
    });
}

filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        render();
    });
});

function editHours(id, hours) {
	  const todo = todos.find((t) => t.id === id);
	  if (todo) todo.hours = hours;
	  render();
	}

function editInPlace(targetEl, editInput, onSave) {
	  let finished = false;
	  const finish = (save) => {
		if (finished) return;
		finished = true;
		if (save) onSave(editInput.value);
		else render();
	  };

	  editInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") finish(true);
		else if (e.key === "Escape") finish(false);
	  });
	  editInput.addEventListener("blur", () => finish(true));

	  targetEl.replaceWith(editInput);
	  editInput.focus();
	  editInput.select();
    }

function startEditingText(li) {
		  const id = li.dataset.id;
		  const todo = todos.find((t) => t.id === id);
		  const textEl = li.querySelector(".todo-text");
		  if (!todo || !textEl) return;

		  const editInput = document.createElement("input");
		  editInput.type = "text";
		  editInput.className = "edit-input";
		  editInput.value = todo.text;
		  editInput.maxLength = 200;
		  editInput.setAttribute("aria-label", "Edit task");

		  editInPlace(textEl, editInput, (value) => editTodo(id, value.trim()));
		}

function startEditingHours(li) {
		  const id = li.dataset.id;
		  const todo = todos.find((t) => t.id === id);
		  const labelEl = li.querySelector(".difficulty");
		  if (!todo || !labelEl) return;

		  const editInput = document.createElement("input");
		  editInput.type = "number";
		  editInput.className = "edit-input edit-hours";
		  editInput.min = "0";
		  editInput.step = "0.25";
		  editInput.value = typeof todo.hours === "number" ? todo.hours : 0;
		  editInput.setAttribute("aria-label", "Edit hours estimate");

		  editInPlace(labelEl, editInput, (value) => editHours(id, parseHours(value)));
		}
    
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    const hours = parseHours(hoursInput.value);
    if (!text) return;
    addTodo(text, hours);
    input.value = "";
    hoursInput.value = "0";
    input.focus();
});

list.addEventListener("click", (e) => {
    if (e.target.matches(".delete-btn")) {
        deleteTodo(e.target.closest(".todo-item").dataset.id);
    }
});

clearCompletedBtn.addEventListener("click", clearCompleted);

list.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
        toggleTodo(e.target.closest(".todo-item").dataset.id);
    }
});

list.addEventListener("dblclick", (e) => {
	  if (e.target.matches(".todo-text")) {
		startEditingText(e.target.closest(".todo-item"));
	  } else if (e.target.matches(".difficulty")) {
		startEditingHours(e.target.closest(".todo-item"));
	  }
});

toggleAllBtn.addEventListener("click", toggleAll);

render();