/**
 * auth.js - Custom Integrated Google UI
 * Handles JWT-based Login, Sign-up, Google OAuth, Profile, and RBAC
 */

const GOOGLE_CLIENT_ID = "533082182818-guuttt7mpaqfgp1595bjkkv31fnhk77c.apps.googleusercontent.com";

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. NORMAL LOGIN ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            try {
                const response = await window.api.post("/auth/login", { email, password });
                const data = await response.json();
                if (response.ok) processLoginSuccess(data);
                else showToast("Error: " + (data.message || "Invalid credentials"), "error");
            } catch (error) {
                showToast("Could not connect to backend.", "error");
            }
        });
    }

    // --- 2. REGISTER SYSTEM ---
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const branch = document.getElementById("registerBranch").value;
            const year = document.getElementById("registerYear").value;
            const password = document.getElementById("registerPassword").value;
            try {
                const response = await window.api.post("/auth/register", {
                    name, email, branch, year, password
                });
                const data = await response.json();
                if (response.ok) {
                    showToast("Registration Successful! You can now log in.", "success");
                    const authToggle = document.getElementById("authToggle");
                    if (authToggle) authToggle.checked = false;
                } else {
                    showToast("Registration failed: " + (data.message || "Error"), "error");
                }
            } catch (error) {
                showToast("Connection failed.", "error");
            }
        });
    }

    initAuthAndProfile();
    startGoogleInitPolling();

    const signInTrigger = document.querySelector(".sign-in-trigger");
    if (signInTrigger) {
        signInTrigger.addEventListener("click", () => {
            const authModal = document.getElementById("authModal");
            if (authModal) authModal.classList.add("show");
            else window.location.href = './index.html';
        });
    }
});

/**
 * --- 3. GOOGLE INITIALIZATION (CUSTOM UI) ---
 */
function startGoogleInitPolling() {
    let attempts = 0;
    const maxAttempts = 50; 
    const poll = setInterval(() => {
        attempts++;
        if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
            clearInterval(poll);
            initGoogleAuth();
        } else if (attempts >= maxAttempts) {
            clearInterval(poll);
        }
    }, 100);
}

function initGoogleAuth() {
    const customBtn = document.getElementById("googleLoginBtn");
    if (customBtn) {
        customBtn.onclick = (e) => {
            e.preventDefault();
            const originalText = customBtn.innerHTML;
            customBtn.innerHTML = "<span>Redirecting...</span>";
            customBtn.disabled = true;

            // Redirect completely to backend passport logic
            window.location.href = `${API_BASE}/auth/google`;
        };
    }
}

// Add a URL parameter listener to catch the return from Passport Google Login
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const success = urlParams.get("success");
    const err = urlParams.get("error");

    if (err === "google_login_failed") {
        showToast("Google Authentication Failed.", "error");
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token && success === "true") {
        // We received a valid auth token from the passport backend
        processLoginSuccess({ token: token, user: { name: "Google User" } }); // The API handles fetching the profile automatically natively via /profile
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

function processLoginSuccess(data) {
    const user = data.user || data;

    if (!data.token) return;

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture || ""
    }));

    const authModal = document.getElementById("authModal");
    if (authModal) authModal.classList.remove("show");

    showToast("Login Successful! Welcome, " + (user.name || "User"), "success");
    initAuthAndProfile();
}

async function initAuthAndProfile() {
    const token = localStorage.getItem("token");
    const protectedPages = []; // All pages are publicly readable; write actions are protected by UI state and API auth
    const isProtected = protectedPages.some(page => window.location.pathname.includes(page));

    if (!token) {
        if (isProtected) {
            showToast("Unauthorized. Please login.", "error");
            setTimeout(() => { window.location.href = './index.html'; }, 1000);
            return;
        }
        updateUIForGuest();
        return;
    }

    try {
        const response = await window.api.get("/auth/profile");
        const data = await response.json();
        if (response.ok && data.success) {
            updateUIForUser(data.user);
        } else if (response.status === 401) {
            handleLogout("Session expired. Please log in again.");
        } else {
            updateUIForGuest();
        }
    } catch (error) {
        updateUIForGuest();
    }
}

function updateUIForUser(user) {
    const loggedInContent = document.getElementById("loggedInContent");
    const guestContent = document.getElementById("guestContent");
    const guestActions = document.getElementById("guestActions");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loggedInContent) loggedInContent.style.display = "block";
    if (guestContent) guestContent.style.display = "none";
    if (guestActions) guestActions.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";

    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");
    const branchEl = document.getElementById("profileBranch");
    const yearEl = document.getElementById("profileYear");
    const avatarEl = document.getElementById("profileAvatar");

    if (nameEl) nameEl.textContent = user.name || "User";
    if (emailEl) emailEl.textContent = user.email || "-";
    if (branchEl) branchEl.textContent = user.branch || "-";
    if (yearEl) yearEl.textContent = user.year || "-";

    const adminElements = document.querySelectorAll(".admin-only");
    const isAdmin = (user.role === "admin" || user.isAdmin);

    if (avatarEl) {
        if (user.picture) {
            avatarEl.innerHTML = `<img src="${user.picture}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">${isAdmin ? '<span id="adminStar" class="admin-star">★</span>' : ''}`;
        } else {
            avatarEl.innerText = (user.name || "U")[0].toUpperCase();
            if (isAdmin) {
                const star = document.createElement('span');
                star.className = "admin-star";
                star.innerText = "★";
                avatarEl.appendChild(star);
            }
        }
    }

    // --- RE-SYNC ADMIN ELEMENTS ---
    if (isAdmin) {
        adminElements.forEach(el => el.style.display = "flex");
    } else {
        adminElements.forEach(el => el.style.display = "none");
    }

    // --- MOBILE UI SYNC (HAMBURGER DRAWER) ---
    const mobileUserInfo = document.getElementById("mobileUserInfo");
    const mobileName = document.getElementById("mobileName");
    const mobileEmail = document.getElementById("mobileEmail");
    const mobileAvatar = document.getElementById("mobileAvatar");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (mobileUserInfo) {
        mobileUserInfo.style.display = "block";
        if (mobileName) mobileName.textContent = user.name || "User";
        if (mobileEmail) mobileEmail.textContent = user.email || "-";
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        
        if (mobileAvatar) {
            if (user.picture) {
                mobileAvatar.innerHTML = `<img src="${user.picture}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                mobileAvatar.innerText = (user.name || "U")[0].toUpperCase();
            }
        }
    }
}

function updateUIForGuest() {
    const loggedInContent = document.getElementById("loggedInContent");
    const guestContent = document.getElementById("guestContent");
    const guestActions = document.getElementById("guestActions");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loggedInContent) loggedInContent.style.display = "none";
    if (guestContent) guestContent.style.display = "block";
    if (guestActions) guestActions.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");

    const mobileUserInfo = document.getElementById("mobileUserInfo");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    if (mobileUserInfo) mobileUserInfo.style.display = "none";
    if (loginBtn) loginBtn.style.display = "block";
    if (signupBtn) signupBtn.style.display = "block";
}

function handleLogout(message = null) {
    if (message) showToast(message, "info");
    else showToast("Logged out successfully.", "success");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTimeout(() => { window.location.href = './index.html'; }, 1000);
}

window.addEventListener("click", (e) => {
    if (e.target.id === "logoutBtn" || e.target.id === "mobileLogoutBtn") handleLogout();
});
