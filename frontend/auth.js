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
    const registerMessage = document.getElementById("registerMessage");

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some(user => user.email === email);

    if (userExists) {
      registerMessage.innerHTML = `<p>This email is already registered.</p>`;
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

    registerMessage.innerHTML = `<p>Registration successful. You can now log in.</p>`;
    registerForm.reset();
  });
}

// Login
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      user => user.email === email && user.password === password
    );

    if (foundUser) {
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      loginMessage.innerHTML = `<p>Login successful. Welcome, ${foundUser.username}.</p>`;
      loginForm.reset();
    } else {
      loginMessage.innerHTML = `<p>Invalid email or password.</p>`;
    }
  });
}