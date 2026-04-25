const API_BASE = "http://localhost:8081";
const accessToken = localStorage.getItem("accessToken");
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

// Protection
if (!accessToken || !currentUser || currentUser.email !== "admin@bitikla.com") {
    alert("Unauthorized access. Admin privileges required.");
    window.location.href = "index.html";
}

// Elements
const tabCreateEvent = document.getElementById("tabCreateEvent");
const tabManageEvents = document.getElementById("tabManageEvents");
const viewCreateEvent = document.getElementById("viewCreateEvent");
const viewManageEvents = document.getElementById("viewManageEvents");
const viewParticipants = document.getElementById("viewParticipants");

// Tab Logic
tabCreateEvent.addEventListener("click", (e) => {
    e.preventDefault();
    tabCreateEvent.classList.add("active");
    tabManageEvents.classList.remove("active");
    viewCreateEvent.style.display = "block";
    viewManageEvents.style.display = "none";
    viewParticipants.style.display = "none";
});

tabManageEvents.addEventListener("click", (e) => {
    e.preventDefault();
    tabManageEvents.classList.add("active");
    tabCreateEvent.classList.remove("active");
    viewCreateEvent.style.display = "none";
    viewManageEvents.style.display = "block";
    viewParticipants.style.display = "none";
    loadManageEvents();
});

document.getElementById("btnBackToEvents").addEventListener("click", () => {
    viewParticipants.style.display = "none";
    viewManageEvents.style.display = "block";
});

// Category Loading (For both Create and Edit forms)
let categoryOptions = "";
async function loadCategoriesMap() {
    try {
        const r = await fetch(`${API_BASE}/api/categories`);
        if (!r.ok) return;
        const list = await r.json();
        const source = Array.isArray(list) && list.length > 0 ? list : [{id:1, categoryName:"Football"}, {id:2, categoryName:"Basketball"}];
        categoryOptions = source.map(c => `<option value="${c.id}">${c.categoryName}</option>`).join('');
        document.getElementById("eventCategory").innerHTML = categoryOptions;
        document.getElementById("editEventCategory").innerHTML = categoryOptions;
    } catch {
        // Fallback
        categoryOptions = `<option value="1">Football</option><option value="2">Basketball</option><option value="4">Tennis</option>`;
        document.getElementById("eventCategory").innerHTML = categoryOptions;
        document.getElementById("editEventCategory").innerHTML = categoryOptions;
    }
}
loadCategoriesMap();

// Create Event
document.getElementById("createEventForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("eventTitle").value;
    const date = document.getElementById("eventDate").value;
    const location = document.getElementById("eventLocation").value;
    const categoryId = document.getElementById("eventCategory").value;
    const description = document.getElementById("eventDescription").value;
    const imageInput = document.getElementById("eventImage");

    const payload = {
        title, date, location, description, categoryId: Number(categoryId), imageUrl: ""
    };

    try {
        if (imageInput.files && imageInput.files.length > 0) {
            const formData = new FormData();
            formData.append("file", imageInput.files[0]);
            const uploadRes = await fetch(`${API_BASE}/api/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData
            });
            if (uploadRes.ok) {
                payload.imageUrl = await uploadRes.text();
            }
        }
    } catch (e) {
        console.warn("Upload failed, proceeding without image", e);
    }

    try {
        const res = await fetch(`${API_BASE}/api/events`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Event created successfully!", "success");
            document.getElementById("createEventForm").reset();
            // Switch to manage events
            tabManageEvents.click();
        } else {
            showToast("Failed to create event.", "error");
        }
    } catch (e) {
        showToast("Server error.", "error");
    }
});

// Manage Events
async function loadManageEvents() {
    const container = document.getElementById("adminEventList");
    container.innerHTML = "<p>Loading events...</p>";
    try {
        const r = await fetch(`${API_BASE}/api/events`);
        if (!r.ok) throw new Error("Failed");
        const events = await r.json();
        
        if (events.length === 0) {
            container.innerHTML = "<p>No events found.</p>";
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        events.forEach(e => {
            html += `
                <tr>
                    <td>${e.id}</td>
                    <td>${escapeHtml(e.title || "Untitled")}</td>
                    <td>${e.date ? e.date.substring(0, 10) : "N/A"}</td>
                    <td>
                        <button class="create-btn btn-sm" onclick="openEditEvent(${e.id})">Edit</button>
                        <button class="create-btn btn-sm" style="background-color: #1e88e5;" onclick="loadParticipants(${e.id}, '${escapeHtml(e.title)}')">Participants</button>
                        <button class="delete-btn btn-sm" onclick="deleteEvent(${e.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = "<p>Error loading events.</p>";
    }
}

async function deleteEvent(id) {
    if (!confirm("Are you sure you want to completely delete this event?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) {
            showToast("Event deleted successfully.", "success");
            loadManageEvents();
        } else {
            showToast("Failed to delete event.", "error");
        }
    } catch {
        showToast("Server error.", "error");
    }
}

// Edit Event Flow
let currentEditEvent = null;
async function openEditEvent(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}`);
        if (!res.ok) throw new Error();
        const event = await res.json();
        currentEditEvent = event;
        document.getElementById("editEventId").value = event.id;
        document.getElementById("editEventTitle").value = event.title || "";
        document.getElementById("editEventDate").value = event.date ? event.date.substring(0,10) : "";
        document.getElementById("editEventLocation").value = event.location || "";
        document.getElementById("editEventCategory").value = event.categoryId || "";
        document.getElementById("editEventDescription").value = event.description || "";
        document.getElementById("editEventModal").style.display = "flex";
    } catch {
        showToast("Could not fetch event details.", "error");
    }
}

document.getElementById("cancelEditEventBtn").onclick = () => {
    document.getElementById("editEventModal").style.display = "none";
};

document.getElementById("editEventForm").onsubmit = async (e) => {
    e.preventDefault();
    if (!currentEditEvent) return;
    
    currentEditEvent.title = document.getElementById("editEventTitle").value;
    currentEditEvent.date = document.getElementById("editEventDate").value;
    currentEditEvent.location = document.getElementById("editEventLocation").value;
    currentEditEvent.categoryId = Number(document.getElementById("editEventCategory").value);
    currentEditEvent.description = document.getElementById("editEventDescription").value;

    try {
        const res = await fetch(`${API_BASE}/api/events`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(currentEditEvent)
        });
        if (res.ok) {
            showToast("Event updated successfully.", "success");
            document.getElementById("editEventModal").style.display = "none";
            loadManageEvents();
        } else {
            showToast("Failed to update event.", "error");
        }
    } catch {
        showToast("Server error.", "error");
    }
};

// Participants Flow
let currentEventForParticipants = null;
async function loadParticipants(eventId, title) {
    currentEventForParticipants = eventId;
    viewManageEvents.style.display = "none";
    viewParticipants.style.display = "block";
    document.getElementById("participantEventTitle").innerText = title;
    
    const container = document.getElementById("participantList");
    container.innerHTML = "<p>Loading participants...</p>";

    try {
        const res = await fetch(`${API_BASE}/api/events/${eventId}/registrations`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        // If the admin is not the creator of the event, the backend throws 403 Forbidden.
        // The user requested to just display "no participant registered" in this case to avoid errors.
        if (res.status === 403 || res.status === 404) {
            container.innerHTML = "<p style='padding: 20px; color: #888; font-style: italic;'>No participants registered yet.</p>";
            return;
        }

        if (!res.ok) throw new Error();
        const users = await res.json();
        
        if (!users || users.length === 0) {
            container.innerHTML = "<p style='padding: 20px; color: #888; font-style: italic;'>No participants registered yet.</p>";
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        users.forEach(u => {
            html += `
                <tr>
                    <td>${escapeHtml(u.username || "")}</td>
                    <td>${escapeHtml(u.email || "")}</td>
                    <td>${escapeHtml(u.phone || "N/A")}</td>
                    <td>
                        <button class="create-btn btn-sm" onclick="openEditUser(${u.userId})">Edit Info</button>
                        <button class="delete-btn btn-sm" onclick="removeParticipant(${u.userId})">Remove</button>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch {
        container.innerHTML = "<p>Error loading participants.</p>";
    }
}

async function removeParticipant(userId) {
    if (!confirm("Are you sure you want to remove this participant from the event?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/events/${currentEventForParticipants}/registrations/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) {
            showToast("Participant removed successfully.", "success");
            loadParticipants(currentEventForParticipants, document.getElementById("participantEventTitle").innerText);
        } else {
            showToast("Failed to remove participant.", "error");
        }
    } catch {
        showToast("Server error.", "error");
    }
}

// Edit User Flow
let currentUserToEdit = null;
async function openEditUser(userId) {
    try {
        const res = await fetch(`${API_BASE}/api/appusers/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error();
        const user = await res.json();
        currentUserToEdit = user;
        
        document.getElementById("editUserId").value = user.id;
        document.getElementById("editUsername").value = user.username || "";
        document.getElementById("editEmail").value = user.email || "";
        document.getElementById("editPhone").value = user.phone || "";
        document.getElementById("editUserModal").style.display = "flex";
    } catch {
        showToast("Could not fetch user details.", "error");
    }
}

document.getElementById("cancelEditUserBtn").onclick = () => {
    document.getElementById("editUserModal").style.display = "none";
};

document.getElementById("editUserForm").onsubmit = async (e) => {
    e.preventDefault();
    if (!currentUserToEdit) return;

    currentUserToEdit.username = document.getElementById("editUsername").value;
    currentUserToEdit.email = document.getElementById("editEmail").value;
    currentUserToEdit.phone = document.getElementById("editPhone").value;

    try {
        const res = await fetch(`${API_BASE}/api/appusers`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(currentUserToEdit)
        });
        if (res.ok) {
            showToast("Participant info updated successfully.", "success");
            document.getElementById("editUserModal").style.display = "none";
            // Refresh participants list
            loadParticipants(currentEventForParticipants, document.getElementById("participantEventTitle").innerText);
        } else {
            showToast("Failed to update participant info.", "error");
        }
    } catch {
        showToast("Server error.", "error");
    }
};

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
