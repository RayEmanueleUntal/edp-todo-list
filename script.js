let tasks = [];

// ========Fetching Data from Local Storage========
document.addEventListener("DOMContentLoaded", () => {
  const storedTasksString = localStorage.getItem("tasks");
  if (storedTasksString) {
    const storedTasks = JSON.parse(storedTasksString);
    tasks.push(...storedTasks);
    console.log(tasks);
    loadTasks(tasks);
  } else {
    console.log("No tasks found in local storage");
  }
});

// ========Priority Modal=========
const priorityBtn = document.getElementById("priorityBtn");
const priorityModal = document.getElementById("priorityModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const priorityForm = document.getElementById("priorityForm");

priorityBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (priorityModal.open) {
    priorityModal.close();
  } else {
    priorityModal.showModal();
  }
});

function closeModal() {
  setTimeout(() => {
    priorityModal.close();
  }, 150);
}

// Close the modal when the "X" is clicked
closeModalBtn.addEventListener("click", () => {
  priorityModal.close();
});

// Close the modal after selection
priorityForm.addEventListener("change", () => {
  priorityModal.close();
});

// =========Add Task Form Submit===========
const taskName = document.getElementById("taskName");
const dot = document.getElementById("dot");
const addTaskBtn = document.getElementById("addTaskBtn");

// Activate button only when taskName is filled
taskName.addEventListener("input", () => {
  addTaskBtn.disabled = !taskName.value.trim();
});

// After Submit Button is Clicked
const taskForm = document.getElementById("taskForm");
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // 1. Text Input
  const textValue = taskName.value;
  if (!textValue) return; // This is unnecessary since button is deactivated if empty. I add it cuz why not + to be more sure

  // 2. Date Input
  const dateValue = dot.value;

  // 3. Priority Input
  const selectedRadio = document.querySelector(
    'input[name="priority"]:checked',
  );
  const priorityValue = selectedRadio ? selectedRadio.value : "none";

  // 4. Task Object
  const task = {
    id: Date.now(),
    text: textValue,
    dueDate: dateValue,
    priority: priorityValue,
    completed: false,
  };

  // Add task to tasks
  tasks.push(task);

  // Save and Render
  saveAndRender();

  // Reset Forms
  addTaskBtn.disabled = true;
  taskForm.reset();
  document.getElementById("priorityForm").reset();
});

// =========Rendering Task===========

// Loading, Categorizing, and Sorting Tasks
function loadTasks(tasks) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const categories = {
    overdue: [],
    today: [],
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

    const diffTime = due - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) categories.overdue.push(task);
    else if (diffDays === 0) categories.today.push(task);
    else if (diffDays < 7) categories.next7days.push(task);
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

// Render Tasks into Task List
function renderTasks(categories) {
  const tasksContainer = document.getElementById("tasksContainer");

  // Load Overdue
  if (categories.overdue.length) {
    tasksContainer.appendChild(
      createListContainer("overdue", categories.overdue),
    );
  }

  // Load Today
  if (categories.today.length) {
    tasksContainer.appendChild(createListContainer("today", categories.today));
  }

  // Load Next 7 Days
  if (categories.next7days.length) {
    tasksContainer.appendChild(
      createListContainer("next7days", categories.next7days),
    );
  }

  // Load Later
  if (categories.later.length) {
    tasksContainer.appendChild(createListContainer("later", categories.later));
  }

  // Load No Date
  if (categories.noDate.length) {
    tasksContainer.appendChild(
      createListContainer("noDate", categories.noDate),
    );
  }

  // Load Completed
  if (categories.completed.length) {
    tasksContainer.appendChild(
      createListContainer("completed", categories.completed),
    );
  }
}

// Returns a Container for the Task List
function createListContainer(cat, tasks) {
  labels = {
    overdue: "Overdue",
    today: "Today",
    next7days: "Next 7 Days",
    later: "Later",
    noDate: "No Date",
    completed: "Completed",
  };

  const catContainer = document.createElement("div");
  catContainer.className = "catContainer";
  catContainer.id = `catContainer_${cat}`;

  const catLabel = document.createElement("h3");
  catLabel.className = "catLabel";
  catLabel.textContent = labels[cat];
  catContainer.appendChild(catLabel);

  const taskList = document.createElement("ol");
  taskList.className = "taskList";
  taskList.id = `taskList_${cat}`;

  tasks.forEach((task) => {
    const htmlCode = `
        <li>
            <div>
                <input class="taskCheckbox" type="checkbox" 
                       id="checkbox_${task.id}" 
                       ${task.completed ? "checked" : ""} 
                       onclick="toggleTaskCompletion(${task.id})">
                
                <label class="taskLabel" for="checkbox_${task.id}">${task.text}</label>
                
                <button class="taskDelBtn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </li>
    `;

    taskList.insertAdjacentHTML("beforeend", htmlCode);
  });

  catContainer.appendChild(taskList);

  return catContainer;
}

//=========Task Operations=========
// Deletes Task
function deleteTask(taskId) {
  console.log("deleting ", taskId);
  tasks = tasks.filter((t) => t.id !== taskId);
  saveAndRender();
}

// Toggles Completion of Task
function toggleTaskCompletion(taskId) {
  console.log("updating completion of ", taskId);
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveAndRender();
  }
}

// ==========Helper Function/s========
function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  document.getElementById("tasksContainer").innerHTML = "";
  loadTasks(tasks);
}
