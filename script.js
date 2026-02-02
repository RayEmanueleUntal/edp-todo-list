const tasks = [];

// ========Fetching Data from Local Storage========
document.addEventListener("DOMContentLoaded", () => {
  const storedTasksString = localStorage.getItem("tasks");
  if (storedTasksString) {
    const storedTasks = JSON.parse(storedTasksString);
    tasks.push(...storedTasks);
    console.log(tasks);
  } else {
    console.log("No tasks found in local storage");
  }
});

// ========Priority Modal=========
const priorityBtn = document.getElementById("priorityBtn");
const priorityModal = document.getElementById("priorityModal");
const closeModalBtn = document.getElementById("closeModalBtn");

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
const selectedRadio = document.querySelector('input[name="priority"]:checked');
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
  const priorityValue = selectedRadio ? selectedRadio.value : "none";

  // 4. Task Object
  const task = {
    id: Date.now(),
    text: textValue,
    dueDate: dateValue,
    priority: priorityValue,
    completed: false,
  };

  console.log(task);
  // Add task to tasks
  tasks.push(task);

  // Save to Local Storage
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Render
  loadTasks(tasks);

  // Reset Forms
  taskForm.reset();
  document.getElementById("priorityForm").reset();
});

// =========Rendering Task===========
function loadTasks(tasks) {
  const now = new Date();

  const categories = {
    overdue: [],
    today: [],
    next7days: [],
    later: [],
    completed: [],
  };

  tasks.forEach((task) => {
    if (task.completed) {
      categories.completed.push(task);
      return;
    }

    const due = new Date(task.dueDate);
    const diffDays = (due - now) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) categories.overdue.push(task);
    else if (diffDays < 1) categories.today.push(task);
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
      const priortiyOrder = { high: 1, medium: 2, low: 3, none: 4 };
      return priortiyOrder[a.priority] - priortiyOrder[b.priority];
    });
  });
}
