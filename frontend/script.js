// This script loads all events from localStorage,
// displays them on the homepage,
// filters them by search input,
// and allows only the creator of an event to cancel it.

const searchInput = document.getElementById("searchInput");
const eventList = document.getElementById("eventList");

// Load events and current user
let events = JSON.parse(localStorage.getItem("events")) || [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Function to display all events
function displayEvents(filteredEvents = events) {
  eventList.innerHTML = "";

  if (filteredEvents.length === 0) {
    eventList.innerHTML = "<p>No events found.</p>";
    return;
  }

  filteredEvents.forEach(event => {
    const eventCard = document.createElement("div");
    eventCard.classList.add("event-card");

    let deleteButton = "";

    // Show delete button only if current user created this event
    if (currentUser && event.createdBy === currentUser.email) {
      deleteButton = `<button class="delete-btn" onclick="deleteEvent(${event.id})">Cancel Event</button>`;
    }

    eventCard.innerHTML = `
      <h3>${event.title}</h3>
      <p>Date: ${event.date}</p>
      <p>Location: ${event.location}</p>
      <p>Category: ${event.category}</p>
      <p>Description: ${event.description}</p>
      ${deleteButton}
    `;

    eventList.appendChild(eventCard);
  });
}

// Function to search events
function filterEvents() {
  const searchText = searchInput.value.toLowerCase();

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchText) ||
    event.location.toLowerCase().includes(searchText)
  );

  displayEvents(filteredEvents);
}

// Function to delete event
function deleteEvent(eventId) {
  events = events.filter(event => event.id !== eventId);
  localStorage.setItem("events", JSON.stringify(events));
  displayEvents(events);
}

// Search input listener
searchInput.addEventListener("input", filterEvents);

// Show events when page loads
displayEvents();