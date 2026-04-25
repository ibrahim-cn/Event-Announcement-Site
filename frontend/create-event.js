// Create event via API (POST /api/events). Requires signed-in user (JWT).
const API_BASE = "http://localhost:8081";

const eventForm = document.getElementById("eventForm");
const eventPreview = document.getElementById("eventPreview");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventLocation = document.getElementById("eventLocation");
const eventImageFile = document.getElementById("eventImageFile");
const eventCategory = document.getElementById("eventCategory");
const eventDescription = document.getElementById("eventDescription");

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
const accessToken = localStorage.getItem("accessToken");

function defaultCategories() {
  return [
    { id: 1, categoryName: "Football" },
    { id: 2, categoryName: "Basketball" },
    { id: 4, categoryName: "Tennis" },
    { id: 6, categoryName: "Other" },
  ];
}

function renderCategoryOptions(categories) {
  if (!eventCategory) return;
  const source = Array.isArray(categories) && categories.length > 0 ? categories : defaultCategories();
  eventCategory.innerHTML = `<option value="">Select Sport</option>`;
  source.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = String(c.id);
    opt.textContent = c.categoryName || `Category ${c.id}`;
    eventCategory.appendChild(opt);
  });
}

async function loadCategories() {
  if (!eventCategory) return;
  try {
    const r = await fetch(`${API_BASE}/api/categories`);
    if (!r.ok) {
      renderCategoryOptions([]);
      return;
    }
    const list = await r.json();
    renderCategoryOptions(list);
  } catch {
    renderCategoryOptions([]);
  }
}

async function uploadImageIfSelected() {
  const file = eventImageFile && eventImageFile.files ? eventImageFile.files[0] : null;
  if (!file) return "";

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/uploads/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Image upload failed.";
    try {
      const errorBody = await response.json();
      if (errorBody && typeof errorBody.message === "string" && errorBody.message.trim()) {
        message = errorBody.message.trim();
      }
    } catch {
      // keep fallback message
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data && typeof data.url === "string" ? data.url : "";
}

if (!currentUser || !accessToken) {
  if (eventForm) eventForm.style.display = "none";
  if (eventPreview) {
    eventPreview.innerHTML = `
    <h3>Önce giriş yapmalısın</h3>
    <p>Etkinlik oluşturabilmek için hesabınla giriş yap.</p>
    <p class="auth-actions">
      <a href="login.html" class="auth-action auth-action--login">Giriş yap</a>
      <a href="register.html" class="auth-action auth-action--register">Kayıt ol</a>
    </p>
  `;
  }
  if (typeof showToast === "function") {
    showToast("Create Event için önce giriş yapmalısın.", "info");
  }
} else {
  loadCategories();

  eventForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const categoryId = Number(eventCategory.value);
    const submitButton = eventForm.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    const payload = {
      title: eventTitle.value,
      description: eventDescription.value,
      date: eventDate.value ? `${eventDate.value}T12:00:00` : null,
      time: "",
      location: eventLocation.value,
      imageUrl: "",
      categoryId: Number.isFinite(categoryId) ? categoryId : null,
    };

    try {
      payload.imageUrl = await uploadImageIfSelected();

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
        <p><strong>Image:</strong> ${escapeHtml(payload.imageUrl || "-")}</p>
        <p><strong>Description:</strong> ${escapeHtml(eventDescription.value)}</p>
        <p><strong>Created by:</strong> ${escapeHtml(currentUser.username)}</p>
        <p><a href="index.html">View on home page</a></p>
      `;
      eventForm.reset();
    } catch (error) {
      eventPreview.innerHTML = `<p>${escapeHtml(error?.message || "Cannot connect to the API.")}</p>`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
