// Constants
const API_URL = "http://localhost:3000";

// DOM elements
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");
const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");

// Event listeners for form toggle
showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// Check if user is already logged in
function checkAuthStatus() {
  const token = localStorage.getItem("token");
  if (token) {
    // Redirect to home page if already logged in
    window.location.href = "home.html";
  }
}

// Display error or success message
function showMessage(formId, type, message) {
  // Remove any existing message
  const existingMessage = document.querySelector(`#${formId} .message`);
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "message",
    type === "error" ? "error-message" : "success-message"
  );
  messageElement.textContent = message;

  // Insert before the form
  const form = document.querySelector(`#${formId} form`);
  form.parentNode.insertBefore(messageElement, form);

  // Remove message after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

// Login functionality
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token and user info
      localStorage.setItem("token", data.token);

      // Parse token to get user information
      const tokenPayload = parseJwt(data.token);
      localStorage.setItem("userId", tokenPayload.userId);
      localStorage.setItem("userName", tokenPayload.name);
      localStorage.setItem("isAdmin", tokenPayload.isAdmin);

      showMessage("login-form", "success", "Login successful! Redirecting...");

      // Redirect to appropriate page based on user role
      setTimeout(() => {
        if (tokenPayload.isAdmin) {
          window.location.href = "admin.html";
        } else {
          window.location.href = "home.html";
        }
      }, 1500);
    } else {
      showMessage("login-form", "error", data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("login-form", "error", "Server error. Please try again later.");
  }
});

// Registration functionality
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(
        "register-form",
        "success",
        "Registration successful! Please log in."
      );

      // Switch to login form after successful registration
      setTimeout(() => {
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
      }, 2000);
    } else {
      showMessage(
        "register-form",
        "error",
        data.message || "Registration failed"
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    showMessage(
      "register-form",
      "error",
      "Server error. Please try again later."
    );
  }
});

// Helper function to parse JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return {};
  }
}

// Run auth check on page load
checkAuthStatus();
