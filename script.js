let tasks = [];

// ========Fetching Data from Local Storage========
document.addEventListener("DOMContentLoaded", () => {
  const storedTasksString = localStorage.getItem("tasks");
  if (storedTasksString) {
    const storedTasks = JSON.parse(storedTasksString);
    tasks.push(...storedTasks);
    loadTasks(tasks);
  }
});

// ========Priority Modal=========
const priorityBtn = document.getElementById("priorityBtn");
const priorityModal = document.getElementById("priorityModal");
const priorityForm = document.getElementById("priorityForm");

priorityBtn.addEventListener("click", () => {
  // 1. Show the modal first so it has dimensions
  priorityModal.show();

  const rect = priorityBtn.getBoundingClientRect();
  const modalWidth = 160;

  // 2. Calculate position (adding window.scrollY handles page scrolling)
  const top = rect.bottom + window.scrollY + 8;
  const left = rect.left + window.scrollX + rect.width / 2 - modalWidth / 2;

  priorityModal.style.top = `${top}px`;
  priorityModal.style.left = `${left}px`;
  priorityModal.style.width = `${modalWidth}px`;
});

priorityForm.addEventListener("change", () => {
  const selected = document.querySelector('input[name="priority"]:checked');
  updatePriorityButton(selected.value);
  priorityModal.close();
});

function updatePriorityButton(priority) {
  priorityBtn.className = "icon-btn";
  if (priority !== "none") priorityBtn.classList.add(priority);
}

// Closes Modal after clicking close button
const closeModalBtn = document.getElementById("closeModalBtn");
closeModalBtn.addEventListener("click", () => {
  priorityModal.close();
});

// Closes Modal after clicking Esc button
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && priorityModal.open) {
    priorityModal.close();
  }
});

// =========Add Task Form Submit===========
const taskName = document.getElementById("taskName");
const dot = document.getElementById("dot");
const addTaskBtn = document.getElementById("addTaskBtn");

taskName.addEventListener("input", () => {
  addTaskBtn.disabled = !taskName.value.trim();
});

const taskForm = document.getElementById("taskForm");
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const textValue = taskName.value;
  if (!textValue) return;

  const dateValue = dot.value;

  const selectedRadio = document.querySelector(
    'input[name="priority"]:checked',
  );
  const priorityValue = selectedRadio ? selectedRadio.value : "none";

  const task = {
    id: Date.now(),
    text: textValue,
    dueDate: dateValue,
    priority: priorityValue,
    completed: false,
  };

  tasks.push(task);
  saveAndRender();

  taskForm.reset();
  priorityForm.reset();
  updatePriorityButton("none");
  addTaskBtn.disabled = true;
});

// =========Rendering Task===========
function loadTasks(tasks) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const categories = {
    overdue: [],
    today: [],
    tomorrow: [],
    next7days: [],
    later: [],
    noDate: [],
    completed: [],
  };

  tasks.forEach((task) => {
    if (task.completed) {
      categories.completed.push(task);
      return;
    }

    if (!task.dueDate) {
      categories.noDate.push(task);
      return;
    }

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = (due - now) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) categories.overdue.push(task);
    else if (diffDays === 0) categories.today.push(task);
    else if (diffDays === 1) categories.tomorrow.push(task);
    else if (diffDays <= 7) categories.next7days.push(task);
    else categories.later.push(task);
  });

  // Sort Each Category
  Object.keys(categories).forEach((cat) => {
    categories[cat].sort((a, b) => {
      if (cat === "overdue" || cat === "next7days" || cat === "later") {
        // first by date
        const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
      }
      // then by priority: high, medium, low, none
      const priorityOrder = { high: 1, medium: 2, low: 3, none: 4 };
      const rankA = priorityOrder[a.priority] || 4;
      const rankB = priorityOrder[b.priority] || 4;
      return rankA - rankB;
    });
  });

  renderTasks(categories);
}

function renderTasks(categories) {
  const tasksContainer = document.getElementById("tasksContainer");
  tasksContainer.innerHTML = "";

  Object.entries(categories).forEach(([cat, list]) => {
    if (!list.length) return;
    tasksContainer.appendChild(createListContainer(cat, list));
  });
}

function createListContainer(cat, tasks) {
  const labels = {
    overdue: "Overdue",
    today: "Today",
    tomorrow: "Tomorrow",
    next7days: "Next 7 Days",
    later: "Later",
    noDate: "No Date",
    completed: "Completed",
  };

  const catContainer = document.createElement("div");
  catContainer.className = "catContainer";

  const catLabel = document.createElement("h3");
  catLabel.textContent = labels[cat];
  catContainer.appendChild(catLabel);

  const taskList = document.createElement("ul");
  taskList.className = "taskList";

  tasks.forEach((task) => {
    taskList.innerHTML += `
    <li class="taskItem ${task.completed ? "completed" : ""}">
      <input type="checkbox" ${
        task.completed ? "checked" : ""
      } onclick="toggleTaskCompletion(${task.id})" />
      
      <span class="task-text ${task.priority}">${task.text}</span>
      
      <button onclick="deleteTask(${task.id})">
        <i class="fas fa-trash"></i>
      </button>
    </li>
  `;
  });

  catContainer.appendChild(taskList);
  return catContainer;
}

//=========Task Operations=========
function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveAndRender();
}

function toggleTaskCompletion(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveAndRender();
  }
}

// ==========Helper Function/s========
function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks(tasks);
}
