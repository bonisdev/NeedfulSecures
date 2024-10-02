// Get the modal
const modal = document.getElementById("myModal");
const overlay = document.getElementById("overlay");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// Function to open the modal
function openModal() {
  modal.style.display = "block";
  overlay.style.display = "block"; // Show overlay
}

// Function to close the modal
function closeModal() {
  modal.style.display = "none";
  overlay.style.display = "none"; // Hide overlay
}
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  closeModal();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) { 
  if (event.target == overlay) {
    closeModal();
  }
};

// Close modal when ESC key is pressed
document.onkeydown = function(evt) {
  evt = evt || window.event;
  if (evt.key === "Escape") {
    closeModal();

    toggleOptions( 'yeeea' )

  }
};