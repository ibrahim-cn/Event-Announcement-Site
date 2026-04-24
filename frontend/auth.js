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
        const password = document.getElementById("registerPassword").value;
        const registerMessage = document.getElementById("registerMessage");

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                showToast("Registration failed. Please check your details.", "error");
                return;
            }

            const data = await response.json();
            persistSession(data);
            showToast("Account created successfully! Welcome.", "success");

            // Redirect to home after a short delay
            setTimeout(() => { window.location.href = "index.html"; }, 1500);
        } catch (err) {
            showToast("Server connection error!", "error");
        }
    });
}

//  Login Form Submission
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
                showToast("Invalid email or password.", "error");
                return;
            }

            const data = await response.json();
            persistSession(data);
            showToast("Login successful!", "success");

            setTimeout(() => { window.location.href = "index.html"; }, 1000);
        } catch (err) {
            showToast("Cannot connect to server.", "error");
        }
    });
}
