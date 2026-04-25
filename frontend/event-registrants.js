const API_BASE = "http://localhost:8081";
const registrantsBox = document.getElementById("registrantsBox");
const token = localStorage.getItem("accessToken");
const eventId = new URLSearchParams(window.location.search).get("eventId");

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

async function loadRegistrants() {
    if (!token) {
        registrantsBox.innerHTML = `<p>Please <a href="login.html">sign in</a>.</p>`;
        return;
    }
    if (!eventId) {
        registrantsBox.innerHTML = "<p>Event ID is missing.</p>";
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/events/${eventId}/registrations`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 403) {
            registrantsBox.innerHTML = "<p>Only the organizer can view this list.</p>";
            return;
        }
        if (!res.ok) {
            registrantsBox.innerHTML = "<p>Could not load registrants.</p>";
            return;
        }
        const contacts = await res.json();
        if (!Array.isArray(contacts) || contacts.length === 0) {
            registrantsBox.innerHTML = "<p>No registrations yet for this event.</p>";
            return;
        }
        registrantsBox.innerHTML = `
            ${contacts.map((c) => `
                <div class="preview-box" style="margin-top: 10px;">
                    <p><strong>${escapeHtml(c.username || "-")}</strong></p>
                    <p>Email: ${escapeHtml(c.email || "-")}</p>
                    <p>Phone: ${escapeHtml(c.phone || "-")}</p>
                    <button type="button" class="delete-btn" data-action="owner-cancel" data-user-id="${Number(c.userId)}">Cancel Registration</button>
                </div>
            `).join("")}
        `;
    } catch {
        registrantsBox.innerHTML = "<p>Cannot reach server.</p>";
    }
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action='owner-cancel']");
    if (!btn) return;
    const userId = Number(btn.dataset.userId);
    if (!Number.isFinite(userId)) return;
    if (!confirm("Cancel this participant's registration?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/events/${eventId}/registrations/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            showToast("Could not cancel this registration.", "error");
            return;
        }
        showToast("Registration cancelled by organizer.", "success");
        await loadRegistrants();
    } catch {
        showToast("Cannot reach server.", "error");
    }
});

loadRegistrants();
