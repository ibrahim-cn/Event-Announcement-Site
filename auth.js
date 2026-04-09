// This script handles user registration and login.
// Registered users are stored in localStorage.
// Logged-in user information is stored as currentUser.


const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

// Register
if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const userExists = users.some(user => user.email === email);

        if (userExists) {
            showToast("This email is already registered", "error");
            return;
        }

        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        showToast("Registration successful", "success");
        registerForm.reset();
    });
}

// Login
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const foundUser = users.find(
            user => user.email === email && user.password === password
        );

        if (foundUser) {
            localStorage.setItem("currentUser", JSON.stringify(foundUser));

            showToast(`Welcome, ${foundUser.username}`, "success");

            loginForm.reset();
        } else {
            showToast("Invalid email or password", "error");
        }
    });
}