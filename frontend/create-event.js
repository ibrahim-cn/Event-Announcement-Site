// Create event via API (POST /api/events). Requires signed-in user (JWT).
const API_BASE = "http://localhost:8081";

const eventForm = document.getElementById("eventForm");
const eventPreview = document.getElementById("eventPreview");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventLocation = document.getElementById("eventLocation");
const eventCategory = document.getElementById("eventCategory");
const eventDescription = document.getElementById("eventDescription");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
const accessToken = localStorage.getItem("accessToken");

async function loadCategories() {
  if (!eventCategory) return;
  try {
    const r = await fetch(`${API_BASE}/api/categories`);
    if (!r.ok) return;
    const list = await r.json();
    eventCategory.innerHTML = "";
    list.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = String(c.id);
      opt.textContent = c.categoryName || `Category ${c.id}`;
      eventCategory.appendChild(opt);
    });
  } catch {
    eventCategory.innerHTML = ` 
    <option value="">Select Sport</option>
    <option value="football">Football</option>
    <option value="basketball">Basketball</option>
    <option value="volleyball">Volleyball</option>
    <option value="tennis">Tennis</option>
    <option value="running">Running</option>
    <option value="other">Other</option> `;
  }
}

if (!currentUser || !accessToken) {
  if (eventForm) eventForm.style.display = "none";
  if (eventPreview) {
    eventPreview.innerHTML = `
    <h3>Access denied</h3>
    <p>You must sign in to create an event.</p>
    <p><a href="login.html">Sign in</a> · <a href="register.html">Register</a></p>
  `;
  }
} else {
  //loadCategories();

  eventForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const categoryId = eventCategory.value;
    const payload = {
      title: eventTitle.value,
      description: eventDescription.value,
      date: eventDate.value ? `${eventDate.value}T12:00:00` : null,
      time: "",
      location: eventLocation.value,
      categoryId: categoryId,
    };

    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      if (response.status === 401) {
        eventPreview.innerHTML =
          "<p>Session expired. <a href='login.html'>Sign in</a> again.</p>";
        return;
      }
      if (!response.ok) {
        eventPreview.innerHTML = `<p>Could not create event: ${escapeHtml(text || response.statusText)}</p>`;
        return;
      }

      eventPreview.innerHTML = `
        <h3>Latest created event</h3>
        <p><strong>Title:</strong> ${escapeHtml(eventTitle.value)}</p>
        <p><strong>Date:</strong> ${escapeHtml(eventDate.value)}</p>
        <p><strong>Location:</strong> ${escapeHtml(eventLocation.value)}</p>
        <p><strong>Description:</strong> ${escapeHtml(eventDescription.value)}</p>
        <p><strong>Created by:</strong> ${escapeHtml(currentUser.username)}</p>
        <p><a href="index.html">View on home page</a></p>
      `;
      eventForm.reset();
    } catch {
      eventPreview.innerHTML = "<p>Cannot connect to the API.</p>";
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
