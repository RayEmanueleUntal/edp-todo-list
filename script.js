// For priority modal
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

  console.log(document.getElementById);
}

// Close the modal when the "X" is clicked
closeModalBtn.addEventListener("click", () => {
  priorityModal.close();
});

// Also keep your form logic to close on selection
priorityForm.addEventListener("change", () => {
  priorityModal.close();
});
