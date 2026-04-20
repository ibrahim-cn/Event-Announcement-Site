// This script logs the current user out
// by removing currentUser from localStorage
// and updating the UI via reload

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
        e.preventDefault();

        // Remove user from storage
        localStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");

        // Show toast notification
        showToast("Logged out successfully", "info");

        setTimeout(() => {
            location.reload();
        }, 800);
    });
}
