// This script logs the current user out
// by removing currentUser from localStorage
// and updating the UI via reload

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
        e.preventDefault();

        // Show toast notification
        showToast("Logged out successfully.", "success");

        
        setTimeout(() => {
            localStorage.clear();
            window.location.href = "index.html";
        }, 1000);
    });
}
