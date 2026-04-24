// This script updates navbar based on login state

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

const loginLink = document.getElementById("loginLink");
const registerLink = document.getElementById("registerLink");
const logoutLink = document.getElementById("logoutLink");
const userInfo = document.getElementById("userInfo");


function updateNavbar() {
    if (currentUser && currentUser.username) {
        // User is logged in: hide login and register links
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";

       
        if (userInfo) {
            userInfo.innerHTML = escapeHtml(currentUser.username);
        }

        // Show the logout option
        if (logoutLink) logoutLink.style.display = "inline-block";
    } else {
        // User is not logged in: reset user info and hide logout link
        if (userInfo) userInfo.innerHTML = "";
        if (logoutLink) logoutLink.style.display = "none";

        // Ensure login and register links are visible
        if (loginLink) loginLink.style.display = "inline-block";
        if (registerLink) registerLink.style.display = "inline-block";
    }
}


function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}


updateNavbar();
