const themeBtn = document.getElementById("toggleThemeBtn");

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        const current = localStorage.getItem("uiTheme") || "light";
        localStorage.setItem("uiTheme", current === "light" ? "dark" : "light");
        window.location.reload();
    });
}
