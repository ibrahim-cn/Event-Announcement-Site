const loginLink = document.getElementById("loginLink");
const registerLink = document.getElementById("registerLink");
const logoutLink = document.getElementById("logoutLink");
const userInfo = document.getElementById("userInfo");

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
        return null;
    }
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function getInitial(username) {
    const clean = typeof username === "string" ? username.trim() : "";
    return clean ? clean.charAt(0).toUpperCase() : "?";
}

function profileImageFor(user) {
    const raw = typeof user?.profileImageUrl === "string" ? user.profileImageUrl.trim() : "";
    return raw || "";
}

function setTheme(theme) {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    localStorage.setItem("uiTheme", theme === "dark" ? "dark" : "light");
}

function toggleTheme() {
    const current = localStorage.getItem("uiTheme") || "light";
    setTheme(current === "light" ? "dark" : "light");
}

function updateNavbar() {
    const currentUser = getCurrentUser();
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!(currentUser && currentUser.username && token);

    const adminLink = document.getElementById("adminLink");

    if (loginLink) loginLink.style.display = isLoggedIn ? "none" : "inline-block";
    if (registerLink) registerLink.style.display = isLoggedIn ? "none" : "inline-block";
    if (logoutLink) logoutLink.style.display = "none";
    if (adminLink) {
        const isAdmin = currentUser && currentUser.email === "admin@bitikla.com";
        adminLink.style.display = isAdmin ? "inline-block" : "none";
    }
    if (!userInfo) return;

    if (!isLoggedIn) {
        userInfo.innerHTML = "";
        userInfo.classList.remove("user-menu");
        return;
    }

    userInfo.classList.add("user-menu");
    userInfo.innerHTML = `
        <button type="button" class="user-menu__trigger">
            ${profileImageFor(currentUser)
            ? `<img class="user-menu__avatar user-menu__avatar--img" src="${escapeHtml(profileImageFor(currentUser))}" alt="Avatar">`
            : `<span class="user-menu__avatar">${escapeHtml(getInitial(currentUser.username))}</span>`
        }
            <span>${escapeHtml(currentUser.username)} ▾</span>
        </button>
        <div class="user-menu__dropdown user-menu__dropdown--wide" id="userMenuDropdown" hidden>
            <div class="user-menu__header">
                <strong>${escapeHtml(currentUser.username)}</strong>
                <small>${escapeHtml(currentUser.email || "")}</small>
            </div>
            <a href="my-events.html">My Events</a>
            <a href="my-events.html?tab=created">My Created Events</a>
            <a href="my-events.html?tab=registered">My Registrations</a>
            <a href="profile.html">Profile</a>
            <a href="settings.html">Settings</a>
            <a href="#" data-action="theme-toggle">Theme: ${localStorage.getItem("uiTheme") === "dark" ? "Dark" : "Light"}</a>
            <a href="profile.html" class="danger-action">Delete Account</a>
            <a href="#" data-action="logout" class="danger-action">Logout</a>
        </div>
    `;
}

if (userInfo) {
    userInfo.addEventListener("click", (e) => {
        const trigger = e.target.closest(".user-menu__trigger");
        if (trigger) {
            e.stopPropagation();
            const dropdown = document.getElementById("userMenuDropdown");
            if (dropdown) dropdown.hidden = !dropdown.hidden;
            return;
        }

        const toggleThemeAction = e.target.closest("[data-action='theme-toggle']");
        if (toggleThemeAction) {
            e.preventDefault();
            toggleTheme();
            updateNavbar();
            return;
        }

    });
}

document.addEventListener("click", (e) => {
    if (!userInfo) return;
    const dropdown = document.getElementById("userMenuDropdown");
    if (!dropdown) return;
    if (!userInfo.contains(e.target)) dropdown.hidden = true;
});

setTheme(localStorage.getItem("uiTheme") || "light");
updateNavbar();
