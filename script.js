// This script handles searching and filtering of sports events

const searchInput = document.getElementById("searchInput");
const eventCards = document.querySelectorAll(".event-card");
const categoryFilter = document.getElementById("categoryFilter");
function filterEvents() {
  const searchText = searchInput.value.toLowerCase();

  eventCards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();

    if (title.includes(searchText)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

searchInput.addEventListener("input", filterEvents);

// Run once when page loads
filterEvents();