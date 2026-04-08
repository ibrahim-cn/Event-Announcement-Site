// This script logs the current user out
// by removing currentUser from localStorage
// and redirecting the user to the login page.

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
  logoutLink.addEventListener("click", function (e) {
    e.preventDefault();

    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");

    alert("You have logged out.");

    window.location.href = "login.html";
  });
}