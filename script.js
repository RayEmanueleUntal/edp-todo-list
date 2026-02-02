// For priority modal
const priorityBtn = document.getElementById("priorityBtn");
const priorityModal = document.getElementById("priorityModal");

priorityBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (priorityModal.open) {
    priorityModal.close();
  } else {
    priorityModal.showModal();
  }
});
