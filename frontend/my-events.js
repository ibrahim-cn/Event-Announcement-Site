const API_BASE = "http://localhost:8081";

const createdEventsList = document.getElementById("createdEventsList");
const registeredEventsList = document.getElementById("registeredEventsList");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
const accessToken = localStorage.getItem("accessToken");
const urlTab = new URLSearchParams(window.location.search).get("tab");

let categoryNames = {};

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function resolveEventImage(event) {
    const raw = typeof event.imageUrl === "string" ? event.imageUrl.trim() : "";
    return raw || "https://picsum.photos/seed/sport-default/600/340";
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

function renderEventCard(event, action) {
    const actionButton = action === "delete"
        ? `<button type="button" class="delete-btn" data-action="delete" data-id="${event.id}">Cancel Event</button>
           <a class="create-btn register-btn" href="event-registrants.html?eventId=${event.id}">View Registrants</a>`
        : `<button type="button" class="create-btn register-btn" data-action="unregister" data-id="${event.id}">Cancel Registration</button>`;

    return `
        <div class="event-card">
            <img class="event-card__image" src="${escapeHtml(resolveEventImage(event))}" alt="${escapeHtml(event.title || "Event image")}" loading="lazy" onerror="this.src='https://picsum.photos/seed/sport-fallback/600/340'; this.onerror=null;">
            <h3>${escapeHtml(event.title || "")}</h3>
            <p>Date: ${escapeHtml(formatEventDate(event))}</p>
            <p>Location: ${escapeHtml(event.location || "")}</p>
            <p>Category: ${escapeHtml(categoryLabel(event))}</p>
            <p>Description: ${escapeHtml(event.description || "")}</p>
            ${actionButton}
        </div>
    `;
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

async function loadMyEvents() {
    if (!currentUser || !accessToken) {
        const html = `
            <div class="preview-box">
                <h3>Please sign in first</h3>
                <p>You need an account to see your own events.</p>
                <p class="auth-actions">
                    <a href="login.html" class="auth-action auth-action--login">Sign in</a>
                    <a href="register.html" class="auth-action auth-action--register">Register</a>
                </p>
            </div>
        `;
        createdEventsList.innerHTML = html;
        registeredEventsList.innerHTML = html;
        return;
    }

    await loadCategoriesMap();

    try {
        const [eventsRes, regsRes] = await Promise.all([
            fetch(`${API_BASE}/api/events`),
            fetch(`${API_BASE}/api/events/registrations/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ]);

        if (!eventsRes.ok) {
            createdEventsList.innerHTML = "<p>Could not load your events.</p>";
            registeredEventsList.innerHTML = "<p>Could not load your events.</p>";
            return;
        }

        if (!regsRes.ok) {
            createdEventsList.innerHTML = "<p>Could not load registration data.</p>";
            registeredEventsList.innerHTML = "<p>Could not load registration data.</p>";
            return;
        }

        const allEvents = await eventsRes.json();
        const registeredIds = new Set(((await regsRes.json()) || []).map((v) => Number(v)));

        const created = allEvents.filter((e) =>
            currentUser && e.appUserId != null && Number(e.appUserId) === Number(currentUser.id)
        );
        const registered = allEvents.filter((e) => registeredIds.has(Number(e.id)));

        createdEventsList.innerHTML = created.length
            ? created.map((e) => renderEventCard(e, "delete")).join("")
            : "<p>You have not created any events yet.</p>";

        registeredEventsList.innerHTML = registered.length
            ? registered.map((e) => renderEventCard(e, "unregister")).join("")
            : "<p>You have not registered for any events yet.</p>";

        if (urlTab === "created") {
            document.querySelectorAll(".my-events-section")[0]?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (urlTab === "registered") {
            document.querySelectorAll(".my-events-section")[1]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    } catch {
        createdEventsList.innerHTML = "<p>Cannot connect to the server.</p>";
        registeredEventsList.innerHTML = "<p>Cannot connect to the server.</p>";
    }
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);

    if (btn.dataset.action === "delete") {
        try {
            const res = await fetch(`${API_BASE}/api/events/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) {
                showToast(await readErrorMessage(res, "Could not cancel event."), "error");
                return;
            }
            showToast("Event cancelled successfully.", "success");
            await loadMyEvents();
        } catch {
            showToast("Cannot reach the server.", "error");
        }
        return;
    }

    if (btn.dataset.action === "unregister") {
        try {
            const res = await fetch(`${API_BASE}/api/events/${id}/registrations`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) {
                showToast(await readErrorMessage(res, "Could not cancel registration."), "error");
                return;
            }
            showToast("Registration cancelled.", "success");
            await loadMyEvents();
        } catch {
            showToast("Cannot reach the server.", "error");
        }
    }

});

loadMyEvents();
