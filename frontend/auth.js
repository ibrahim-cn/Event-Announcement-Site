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
            phone: data.phone || "",
            profileImageUrl: data.profileImageUrl || "",
        })
    );
}

function extractErrorMessage(payload, fallback) {
    if (payload && typeof payload.message === "string" && payload.message.trim()) {
        return payload.message.trim();
    }
    return fallback;
}

// Display form feedback and trigger Toast notification
function setFormFeedback(messageEl, kind, messageHtml, toastMsg) {
    messageEl.className = "form-feedback form-feedback--" + kind;
    messageEl.setAttribute("role", "alert");
    messageEl.innerHTML = `<p class="form-feedback__text">${messageHtml}</p>`;

    if (toastMsg) {
        showToast(toastMsg, kind);
    }
}

//  Register Form Submission
if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const phone = document.getElementById("registerPhone").value;
        const password = document.getElementById("registerPassword").value;
        const submitButton = registerForm.querySelector("button[type='submit']");
        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, phone, password }),
            });

            if (!response.ok) {
                let message = "Registration failed. Please check your details.";
                try {
                    const errorBody = await response.json();
                    message = extractErrorMessage(errorBody, message);
                } catch {
                    // ignore parse errors and use fallback
                }
                showToast(message, "error");
                return;
            }

            const data = await response.json();
            persistSession(data);
            showToast("Account created successfully! Welcome.", "success");

            // Redirect to home after a short delay
            setTimeout(() => { window.location.href = "index.html"; }, 1500);
        } catch (err) {
            showToast("Server connection error!", "error");
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

//  Login Form Submission
if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const submitButton = loginForm.querySelector("button[type='submit']");
        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                let message = "Account not found or invalid credentials.";
                try {
                    const errorBody = await response.json();
                    message = extractErrorMessage(errorBody, message);
                } catch {
                    // ignore parse errors and use fallback
                }
                
                showToast(message, "error");
                
                const registerPrompt = document.getElementById("registerPrompt");
                if (registerPrompt) {
                    registerPrompt.style.display = "block";
                    registerPrompt.classList.add("shake-animation");
                    setTimeout(() => registerPrompt.classList.remove("shake-animation"), 500);
                }
                return;
            }

            const data = await response.json();
            persistSession(data);
            showToast("Login successful!", "success");

            setTimeout(() => { 
                if (data.email === "admin@bitikla.com") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "index.html"; 
                }
            }, 1000);
        } catch (err) {
            showToast("Cannot connect to server.", "error");
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// Improve UX: if already authenticated, avoid showing auth pages again.
if ((registerForm || loginForm) && localStorage.getItem("accessToken")) {
    showToast("You are already logged in.", "info");
    setTimeout(() => { window.location.href = "index.html"; }, 800);
}
