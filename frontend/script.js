// Home: loads events from API; "Register for event" requires login (JWT).
const API_BASE = "http://localhost:8081";

const searchInput = document.getElementById("searchInput");
const eventList = document.getElementById("eventList");
const categoryFilter = document.getElementById("categoryFilter");

let events = [];
let categoryNames = {};
let registeredEventIds = new Set();
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
        populateCategoryFilter(list);
    } catch {
        categoryNames = {};
        populateCategoryFilter([]);
    }
}

function defaultCategories() {
    return [
        { id: 1, categoryName: "Football" },
        { id: 2, categoryName: "Basketball" },
        { id: 4, categoryName: "Tennis" },
        { id: 6, categoryName: "Other" },
    ];
}

function populateCategoryFilter(categories) {
    if (!categoryFilter) return;
    const selected = categoryFilter.value || "all";
    const source = Array.isArray(categories) && categories.length > 0 ? categories : defaultCategories();
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    source.forEach((c) => {
        const option = document.createElement("option");
        option.value = String(c.id);
        option.textContent = c.categoryName || `Category ${c.id}`;
        categoryFilter.appendChild(option);
    });
    categoryFilter.value = source.some((c) => String(c.id) === selected) ? selected : "all";
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

function resolveEventImage(event) {
    const raw = typeof event.imageUrl === "string" ? event.imageUrl.trim() : "";
    if (raw) return raw;

    const categoryName = (event.categoryName || categoryNames[event.categoryId] || "").toLowerCase();
    
    if (categoryName.includes("football") || categoryName.includes("soccer")) {
        return "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop";
    } else if (categoryName.includes("basketball")) {
        return "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop";
    } else if (categoryName.includes("tennis")) {
        return "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop";
    } else if (categoryName.includes("volleyball")) {
        return "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=600&auto=format&fit=crop";
    } else if (categoryName.includes("run") || categoryName.includes("marathon")) {
        return "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=600&auto=format&fit=crop";
    } else if (categoryName.includes("swim")) {
        return "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop";
    }
    
    // Generic high-quality sports fallback
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop";
}

async function readErrorMessage(response, fallbackMessage) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try {
            const body = await response.json();
            if (body && typeof body.message === "string" && body.message.trim()) {
                return body.message.trim();
            }
        } catch {
            return fallbackMessage;
        }
    }
    try {
        const text = await response.text();
        return text || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
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
        const isRegistered = registeredEventIds.has(Number(event.id));

        let deleteButton = "";
        if (isOwner) {
            deleteButton = `<button type="button" class="delete-btn" data-action="delete" data-id="${event.id}">Cancel Event</button>
                <a class="create-btn register-btn" href="event-registrants.html?eventId=${event.id}">View Registrants</a>`;
        }

        const registerButton = isOwner
            ? `<button type="button" class="create-btn register-btn" disabled title="You cannot register to your own event.">Your Event</button>`
            : isRegistered
                ? `<button type="button" class="create-btn register-btn" style="background-color: #333;" data-action="unregister" data-id="${event.id}" data-title="${escapeHtml(event.title || 'Event')}">Cancel Registration</button>`
                : `<button type="button" class="create-btn register-btn" data-action="register" data-id="${event.id}" data-title="${escapeHtml(event.title || 'Event')}">Register</button>`;

        eventCard.innerHTML = `
      <img class="event-card__image" src="${escapeHtml(resolveEventImage(event))}" alt="${escapeHtml(event.title || "Event image")}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop'; this.onerror=null;">
      <h3>${escapeHtml(event.title || "")}</h3>
      <p>Date: ${escapeHtml(formatEventDate(event))}</p>
      <p>Location: ${escapeHtml(event.location || "")}</p>
      <p>Category: ${escapeHtml(categoryLabel(event))}</p>
      <p>Description: ${escapeHtml(event.description || "")}</p>
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

    // REGISTER ACTION
    if (btn.dataset.action === "register") {
        if (!accessToken) {
            localStorage.setItem("pendingRegEventId", id);
            localStorage.setItem("pendingRegEventTitle", btn.dataset.title || "Event");
            window.location.href = "login.html";
            return;
        }
        await triggerRegistration(id);
        return;
    }

    // UNREGISTER ACTION
    if (btn.dataset.action === "unregister") {
        if (!accessToken) return;
        showCancelConfirmation(id, btn.dataset.title || "Event");
        return;
    }

    // DELETE ACTION
    if (btn.dataset.action === "delete") {
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE}/api/events/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.status === 401) {
                showToast("Please sign in again.", "error");
                setTimeout(() => { window.location.href = "login.html"; }, 1200);
                return;
            }
            if (!res.ok) {
                const message = await readErrorMessage(res, "You are not allowed to cancel this event.");
                showToast(message, "error");
                return;
            }
            showToast("Event cancelled successfully.", "success");
            await loadEvents();
        } catch {
            showToast("Cannot reach the server.", "error");
        }
    }

});

function filterEvents() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";
    const filteredEvents = events.filter(
        (event) =>
            (
                (event.title || "").toLowerCase().includes(searchText) ||
                (event.location || "").toLowerCase().includes(searchText)
            ) &&
            (selectedCategory === "all" || String(event.categoryId || "") === selectedCategory)
    );
    displayEvents(filteredEvents);
}

searchInput.addEventListener("input", filterEvents);
if (categoryFilter) {
    categoryFilter.addEventListener("change", filterEvents);
}

async function loadEvents() {
    try {
        await loadCategoriesMap();
        if (accessToken) {
            await loadMyRegistrations();
        } else {
            registeredEventIds = new Set();
        }
        const r = await fetch(`${API_BASE}/api/events`);
        if (!r.ok) {
            eventList.innerHTML = "<p>Events could not be loaded.</p>";
            return;
        }
        events = await r.json();
        displayEvents(events);
        
        // Check for pending registration intent after logging in
        const pendingId = localStorage.getItem("pendingRegEventId");
        const pendingTitle = localStorage.getItem("pendingRegEventTitle");
        if (pendingId && accessToken) {
            localStorage.removeItem("pendingRegEventId");
            localStorage.removeItem("pendingRegEventTitle");
            showRegistrationPrompt(Number(pendingId), pendingTitle);
        }

    } catch {
        eventList.innerHTML = `<p>Cannot reach API at ${API_BASE}. Start the backend.</p>`;
        showToast("API connection failed!", "error");
    }
}

async function triggerRegistration(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}/registrations`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.status === 401) {
            showToast("Your session is invalid. Please sign in again.", "error");
            setTimeout(() => { window.location.href = "login.html"; }, 1500);
            return;
        }
        if (!res.ok) {
            const message = await readErrorMessage(res, "Registration failed.");
            showToast(message, "error");
            return;
        }
        registeredEventIds.add(id);
        filterEvents();
        showToast("You are now registered for this event!", "success");
    } catch {
        showToast("Cannot reach the server. Is the backend running?", "error");
    }
}

function showRegistrationPrompt(id, title) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
       <div class="modal-content">
           <h3>Event Registration</h3>
           <p>You recently showed interest in registering for <strong>${escapeHtml(title)}</strong>.</p>
           <p>Would you like to complete your registration now?</p>
           <div class="modal-actions">
               <button id="confirmRegBtn" class="create-btn">Yes, Register</button>
               <button id="cancelRegBtn" class="delete-btn">Cancel</button>
           </div>
       </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("confirmRegBtn").onclick = async () => {
        document.body.removeChild(overlay);
        await triggerRegistration(id);
    };
    document.getElementById("cancelRegBtn").onclick = () => {
        document.body.removeChild(overlay);
    };
}

async function triggerCancelRegistration(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}/registrations`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.status === 401) {
            showToast("Please sign in again.", "error");
            setTimeout(() => { window.location.href = "login.html"; }, 1200);
            return;
        }
        if (!res.ok) {
            const message = await readErrorMessage(res, "Could not cancel registration.");
            showToast(message, "error");
            return;
        }
        registeredEventIds.delete(id);
        filterEvents();
        showToast("Registration cancelled successfully.", "success");
    } catch {
        showToast("Cannot reach the server.", "error");
    }
}

function showCancelConfirmation(id, title) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
       <div class="modal-content">
           <h3>Cancel Registration</h3>
           <p>Are you sure you want to cancel your registration for <strong>${escapeHtml(title)}</strong>?</p>
           <p>This action cannot be undone.</p>
           <div class="modal-actions">
               <button id="confirmCancelBtn" class="delete-btn" style="background-color: #a83232; color: white;">Yes, Cancel</button>
               <button id="abortCancelBtn" class="create-btn">No, Keep It</button>
           </div>
       </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("confirmCancelBtn").onclick = async () => {
        document.body.removeChild(overlay);
        await triggerCancelRegistration(id);
    };
    document.getElementById("abortCancelBtn").onclick = () => {
        document.body.removeChild(overlay);
    };
}

async function loadMyRegistrations() {
    try {
        const r = await fetch(`${API_BASE}/api/events/registrations/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!r.ok) {
            registeredEventIds = new Set();
            return;
        }
        const ids = await r.json();
        registeredEventIds = new Set((Array.isArray(ids) ? ids : []).map((v) => Number(v)));
    } catch {
        registeredEventIds = new Set();
    }
}

loadEvents();
