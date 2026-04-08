// This script checks whether a user is logged in,
// allows logged-in users to create events,
// saves events to localStorage,
// and stores the creator's email with each event.

const eventForm = document.getElementById("eventForm");
const eventPreview = document.getElementById("eventPreview");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventLocation = document.getElementById("eventLocation");
const eventCategory = document.getElementById("eventCategory");
const eventDescription = document.getElementById("eventDescription");

// Check logged-in user
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  eventForm.style.display = "none";
  eventPreview.innerHTML = `
    <h3>Access Denied</h3>
    <p>You must log in before creating an event.</p>
    <p><a href="login.html">Go to Login Page</a></p>
  `;
} else {
  eventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newEvent = {
      id: Date.now(),
      title: eventTitle.value,
      date: eventDate.value,
      location: eventLocation.value,
      category: eventCategory.value,
      description: eventDescription.value,
      createdBy: currentUser.email
    };

    let savedEvents = JSON.parse(localStorage.getItem("events")) || [];
    savedEvents.push(newEvent);
    localStorage.setItem("events", JSON.stringify(savedEvents));

    eventPreview.innerHTML = `
      <h3>Latest Created Event</h3>
      <p><strong>Title:</strong> ${newEvent.title}</p>
      <p><strong>Date:</strong> ${newEvent.date}</p>
      <p><strong>Location:</strong> ${newEvent.location}</p>
      <p><strong>Category:</strong> ${newEvent.category}</p>
      <p><strong>Description:</strong> ${newEvent.description}</p>
      <p><strong>Created By:</strong> ${currentUser.username}</p>
    `;

    eventForm.reset();
  });
}