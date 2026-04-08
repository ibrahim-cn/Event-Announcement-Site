// Home: loads events from API; "Register for event" requires login (JWT).
const API_BASE = "http://localhost:8081";

const searchInput = document.getElementById("searchInput");
const eventList = document.getElementById("eventList");

let events = [];
let categoryNames = {};
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
const accessToken = localStorage.getItem("accessToken");

async function loadCategoriesMap() {
  try {
    const r = await fetch(`${API_BASE}/api/categories`);
    if (!r.ok) return;
    const list = await r.json();
    categoryNames = Object.fromEntries(
      list.map((c) => [String(c.id), c.categoryName || "—"])
    );
  } catch {
    categoryNames = {};
  }
}

function formatEventDate(event) {
  if (!event.date) return "—";
  const s = typeof event.date === "string" ? event.date : String(event.date);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function categoryLabel(event) {
  if (event.categoryName) return event.categoryName;
  const id = event.categoryId != null ? String(event.categoryId) : "";
  return categoryNames[id] || (id ? `#${id}` : "—");
}

function displayEvents(filteredEvents = events) {
  eventList.innerHTML = "";

  if (filteredEvents.length === 0) {
    eventList.innerHTML = "<p>No events found.</p>";
    return;
  }

  filteredEvents.forEach((event) => {
    const eventCard = document.createElement("div");
    eventCard.classList.add("event-card");

    const isOwner =
      currentUser && event.appUserId != null && Number(event.appUserId) === Number(currentUser.id);

    let deleteButton = "";
    if (isOwner) {
      deleteButton = `<button type="button" class="delete-btn" data-action="delete" data-id="${event.id}">Cancel Event</button>`;
    }

    const registerButton = `<button type="button" class="create-btn register-btn" data-action="register" data-id="${event.id}">Register for event</button>`;

    eventCard.innerHTML = `
      <h3>${escapeHtml(event.title || "")}</h3>
      <p>Date: ${escapeHtml(formatEventDate(event))}</p>
      <p>Location: ${escapeHtml(event.location || "")}</p>
      <p>Category: ${escapeHtml(categoryLabel(event))}</p>
      <p>Description: ${escapeHtml(event.description || "")}</p>
      <p class="reg-hint">${accessToken ? "" : "To register, please <a href='login.html'>sign in</a> or <a href='register.html'>create an account</a>."}</p>
      ${registerButton}
      ${deleteButton}
    `;

    eventList.appendChild(eventCard);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

eventList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "register") {
    if (!accessToken) {
      alert("Please sign in or register before signing up for an event.");
      window.location.href = "login.html";
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/registrations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 401) {
        alert("Your session is invalid. Please sign in again.");
        window.location.href = "login.html";
        return;
      }
      const text = await res.text();
      if (!res.ok) {
        alert(text || res.statusText);
        return;
      }
      alert("You are now registered for this event.");
    } catch {
      alert("Cannot reach the server. Is the backend running?");
    }
    return;
  }

  if (btn.dataset.action === "delete") {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const text = await res.text();
      if (!res.ok) {
        alert(text || res.statusText);
        return;
      }
      await loadEvents();
    } catch {
      alert("Cannot reach the server.");
    }
  }
});

function filterEvents() {
  const searchText = searchInput.value.toLowerCase();
  const filteredEvents = events.filter(
    (event) =>
      (event.title || "").toLowerCase().includes(searchText) ||
      (event.location || "").toLowerCase().includes(searchText)
  );
  displayEvents(filteredEvents);
}

searchInput.addEventListener("input", filterEvents);

async function loadEvents() {
  try {
    await loadCategoriesMap();
    const r = await fetch(`${API_BASE}/api/events`);
    if (!r.ok) {
      eventList.innerHTML = "<p>Events could not be loaded.</p>";
      return;
    }
    events = await r.json();
    displayEvents(events);
  } catch {
    eventList.innerHTML = `<p>Cannot reach API at ${API_BASE}. Start the backend.</p>`;
  }
}

loadEvents();
