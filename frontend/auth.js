// Login / register — JWT. English UI messages (success / error boxes).
const API_BASE = "http://localhost:8081";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

function persistSession(data) {
  localStorage.setItem("accessToken", data.token);
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: data.userId,
      username: data.username,
      email: data.email,
    })
  );
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/** message box: kind = success | error | info */
function setFormFeedback(messageEl, kind, messageHtml) {
  messageEl.className = "form-feedback form-feedback--" + kind;
  messageEl.setAttribute("role", "alert");
  messageEl.innerHTML = `<p class="form-feedback__text">${messageHtml}</p>`;
}

function parseApiError(bodyText, status) {
  let fromServer = "";
  try {
    const j = JSON.parse(bodyText);
    if (Array.isArray(j.errors) && j.errors.length > 0) {
      fromServer = j.errors.join(" ");
    } else {
      fromServer = (j.message || j.detail || "").trim();
    }
    if (
      !fromServer &&
      typeof j.error === "string" &&
      j.error !== "Conflict" &&
      j.error !== "Bad Request"
    ) {
      fromServer = j.error;
    }
  } catch {
    if (bodyText && bodyText.trim() && !bodyText.trim().startsWith("{")) {
      fromServer = bodyText.trim();
    }
  }

  if (fromServer) {
    if (
      fromServer.includes("Validation failed") &&
      fromServer.includes("Error count:")
    ) {
      return escapeHtml(
        "Some fields are invalid. Password must be at least 6 characters; use a valid email format."
      );
    }
    return escapeHtml(fromServer);
  }

  if (status === 401) {
    return escapeHtml("Invalid email or password.");
  }
  if (status === 409) {
    return escapeHtml(
      "This email is already registered. Sign in or use a different email."
    );
  }
  if (status === 400) {
    return escapeHtml(
      "Invalid input. Check all fields (password must be at least 6 characters)."
    );
  }
  return escapeHtml("Something went wrong (" + status + "). Please try again.");
}

function showError(messageEl, status, bodyText) {
  setFormFeedback(messageEl, "error", parseApiError(bodyText, status));
}

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const registerMessage = document.getElementById("registerMessage");

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        showError(registerMessage, response.status, await response.text());
        return;
      }

      const data = await response.json();
      persistSession(data);
      setFormFeedback(
        registerMessage,
        "success",
        "<strong>Success.</strong> Your account was created and you are signed in."
      );
      registerForm.reset();
    } catch {
      setFormFeedback(
        registerMessage,
        "info",
        "Cannot reach the server. Is the backend running? (" +
          escapeHtml(API_BASE) +
          ")"
      );
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        showError(loginMessage, response.status, await response.text());
        return;
      }

      const data = await response.json();
      persistSession(data);
      setFormFeedback(
        loginMessage,
        "success",
        "<strong>Success.</strong> Welcome, " + escapeHtml(data.username) + "."
      );
      loginForm.reset();
    } catch {
      setFormFeedback(
        loginMessage,
        "info",
        "Cannot reach the server. Is the backend running? (" +
          escapeHtml(API_BASE) +
          ")"
      );
    }
  });
}
