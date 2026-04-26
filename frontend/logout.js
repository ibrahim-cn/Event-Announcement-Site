// This script logs the current user out
// by removing currentUser from localStorage
// and updating the UI via reload

document.addEventListener("click", function (e) {
    const logoutTarget = e.target.closest("[data-action='logout']");
    if (!logoutTarget) return;

    e.preventDefault();
    showToast("Logged out successfully.", "success");

    setTimeout(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    }, 1000);
});
