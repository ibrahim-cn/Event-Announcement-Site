// This file provides a simple toast notification system.
// It allows showing temporary messages (success, error, info)
// on the screen to give feedback to the user.
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
