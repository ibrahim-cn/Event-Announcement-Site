const API_BASE = "http://localhost:8081";
const profileBox = document.getElementById("profileBox");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const profileImageFile = document.getElementById("profileImageFile");
const uploadProfileImageBtn = document.getElementById("uploadProfileImageBtn");
const token = localStorage.getItem("accessToken");

async function loadProfile() {
    if (!token) {
        profileBox.innerHTML = `<p>Please <a href="login.html">sign in</a>.</p>`;
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/account/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            profileBox.innerHTML = "<p>Could not load profile.</p>";
            return;
        }
        const user = await res.json();
        profileBox.innerHTML = `
            <p><img src="${user.profileImageUrl || "https://picsum.photos/seed/profile-default/120/120"}" alt="Profile image" style="width:96px;height:96px;border-radius:50%;object-fit:cover;margin-bottom:10px;"></p>
            <p><strong>Username:</strong> ${user.username || "-"}</p>
            <p><strong>Email:</strong> ${user.email || "-"}</p>
            <p><strong>Phone:</strong> ${user.phone || "-"}</p>
            <p><strong>User ID:</strong> ${user.id || "-"}</p>
        `;
        localStorage.setItem("currentUser", JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone || "",
            profileImageUrl: user.profileImageUrl || "",
        }));
    } catch {
        profileBox.innerHTML = "<p>Cannot reach server.</p>";
    }
}

loadProfile();

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
        if (!token) {
            profileBox.innerHTML = `<p>Please <a href="login.html">sign in</a>.</p>`;
            return;
        }
        if (!confirm("Delete your account and all your events? This cannot be undone.")) return;
        try {
            const res = await fetch(`${API_BASE}/api/account/me`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                profileBox.innerHTML = "<p>Account deletion failed.</p>";
                return;
            }
            localStorage.removeItem("accessToken");
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        } catch {
            profileBox.innerHTML = "<p>Cannot reach server.</p>";
        }
    });
}

if (uploadProfileImageBtn) {
    uploadProfileImageBtn.addEventListener("click", async () => {
        if (!token) {
            profileBox.innerHTML = `<p>Please <a href="login.html">sign in</a>.</p>`;
            return;
        }
        const file = profileImageFile && profileImageFile.files ? profileImageFile.files[0] : null;
        if (!file) {
            profileBox.innerHTML = "<p>Please select an image file first.</p>";
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/api/account/me/profile-image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                profileBox.innerHTML = "<p>Profile image upload failed.</p>";
                return;
            }
            await loadProfile();
        } catch {
            profileBox.innerHTML = "<p>Cannot reach server.</p>";
        }
    });
}
