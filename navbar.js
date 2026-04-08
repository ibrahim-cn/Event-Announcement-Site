// This script updates navbar based on login state

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const loginLink = document.getElementById("loginLink");
const registerLink = document.getElementById("registerLink");
const logoutLink = document.getElementById("logoutLink");
const userInfo = document.getElementById("userInfo");

function updateNavbar() {
    if (currentUser) {
        // hide login/register
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";

        // show user info
        if (userInfo) {
            userInfo.innerHTML = `${currentUser.username}`;
        }

        // show logout
        if (logoutLink) logoutLink.style.display = "inline-block";
    } else {
        // not logged in
        if (userInfo) userInfo.innerHTML = "";

        if (logoutLink) logoutLink.style.display = "none";
    }
}

updateNavbar();