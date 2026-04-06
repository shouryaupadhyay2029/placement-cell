/**
 * auth.js - Auth State System & Google Integration
 * Handles JWT-based Login, Sign-up, Google OAuth, Profile, and RBAC
 */

const authUtil = {
    getToken() {
        return localStorage.getItem("token");
    },
    setToken(token) {
        localStorage.setItem("token", token);
    },
    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },
    setUser(user) {
        localStorage.setItem("user", JSON.stringify(user));
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (typeof showToast === 'function') {
            showToast("Logged out successfully.", "info");
        }
        updateUIForGuest();
        setTimeout(() => window.location.reload(), 800);
    }
};

window.authUtil = authUtil;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Process URL Token exactly once on load.
    processUrlToken();
    
    // 2. Initialize UI state
    initAuthAndProfile();

    // 3. Attach standard form bindings
    bindForms();

    // 4. Attach Google Auth Trigger
    initGoogleAuthBtn();
});

function processUrlToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const success = urlParams.get("success");
    const err = urlParams.get("error");

    if (err) {
        if (typeof showToast === 'function') showToast("Google Authentication Failed.", "error");
        cleanUrl();
    } else if (token && success === "true") {
        console.log("✅ Authenticated securely via Google OAuth");
        authUtil.setToken(token);
        cleanUrl();
    }
}

function cleanUrl() {
    window.history.replaceState({}, document.title, window.location.pathname);
}

async function initAuthAndProfile() {
    if (!authUtil.isLoggedIn()) {
        updateUIForGuest();
        return;
    }

    try {
        // Fetch current profile from backend securely using the token attached natively via api.js
        const response = await window.api.get("/auth/profile");
        const data = await response.json();
        
        if (response.ok && data.success) {
            authUtil.setUser(data.user);
            updateUIForUser(data.user);
        } else {
            // Token is invalid or expired
            console.error("Token verification failed - logging user out");
            authUtil.logout();
        }
    } catch (error) {
        console.error("Profile fetch network error", error);
        updateUIForGuest();
    }
}

function updateUIForGuest() {
    const loggedInContent = document.getElementById("loggedInContent");
    const guestContent = document.getElementById("guestContent");
    const guestActions = document.getElementById("guestActions");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loggedInContent) loggedInContent.style.display = "none";
    if (guestContent) guestContent.style.display = "block";
    if (guestActions) guestActions.style.display = "flex";
    if (logoutBtn) logoutBtn.style.display = "none";

    const mobileUserInfo = document.getElementById("mobileUserInfo");
    if (mobileUserInfo) mobileUserInfo.style.display = "none";
}

function updateUIForUser(user) {
    const loggedInContent = document.getElementById("loggedInContent");
    const guestContent = document.getElementById("guestContent");
    const guestActions = document.getElementById("guestActions");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loggedInContent) loggedInContent.style.display = "block";
    if (guestContent) guestContent.style.display = "none";
    if (guestActions) guestActions.style.display = "none";
    if (logoutBtn) {
        logoutBtn.style.display = "block";
        logoutBtn.onclick = () => authUtil.logout();
    }

    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");
    const roleEl = document.getElementById("profileRole"); 
    const avatarEl = document.getElementById("profileAvatar");
    const branchEl = document.getElementById("profileBranch");
    const yearEl = document.getElementById("profileYear");

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (branchEl) branchEl.textContent = user.branch || 'N/A';
    if (yearEl) yearEl.textContent = user.year || 'N/A';

    if (avatarEl) {
        if (user.picture) {
            avatarEl.innerHTML = `<img src="${user.picture}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            avatarEl.style.border = "none";
        } else {
            avatarEl.textContent = user.name.charAt(0).toUpperCase();
        }
    }

    // Connect mobile view
    const mobileUserInfo = document.getElementById("mobileUserInfo");
    if (mobileUserInfo) {
        mobileUserInfo.style.display = "block";
        const mobileName = document.getElementById("mobileName");
        const mobileEmail = document.getElementById("mobileEmail");
        const mobileAvatar = document.getElementById("mobileAvatar");
        if (mobileName) mobileName.textContent = user.name;
        if (mobileEmail) mobileEmail.textContent = user.email;
        if (mobileAvatar) {
            if (user.picture) {
                mobileAvatar.innerHTML = `<img src="${user.picture}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else {
                mobileAvatar.textContent = user.name.charAt(0).toUpperCase();
            }
        }
        
        const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
        if (mobileLogoutBtn) {
            mobileLogoutBtn.onclick = () => authUtil.logout();
        }
    }
}

function bindForms() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            try {
                const response = await window.api.post("/auth/login", { email, password });
                const data = await response.json();
                if (response.ok) {
                    authUtil.setToken(data.token);
                    authUtil.setUser(data.user);
                    if (typeof showToast === 'function') showToast("Login Successful!", "success");
                    
                    const authModal = document.getElementById("authModal");
                    if (authModal) authModal.classList.remove("show");
                    
                    initAuthAndProfile();
                } else {
                    if (typeof showToast === 'function') showToast("Error: " + (data.message || "Invalid credentials"), "error");
                }
            } catch (error) {
                if (typeof showToast === 'function') showToast("Could not connect to backend.", "error");
            }
        });
    }

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
                    if (typeof showToast === 'function') showToast("Registration Successful! You can now log in.", "success");
                    const authToggle = document.getElementById("authToggle");
                    if (authToggle) authToggle.checked = false;
                } else {
                    if (typeof showToast === 'function') showToast("Registration failed: " + (data.message || "Error"), "error");
                }
            } catch (error) {
                if (typeof showToast === 'function') showToast("Connection failed.", "error");
            }
        });
    }

    const signInTrigger = document.querySelector(".sign-in-trigger");
    const loginBtn = document.getElementById("loginBtn"); // specifically from mobile drop
    if (signInTrigger) {
        signInTrigger.addEventListener("click", () => {
            const authModal = document.getElementById("authModal");
            if (authModal) authModal.classList.add("show");
        });
    }
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const authModal = document.getElementById("authModal");
            if (authModal) authModal.classList.add("show");
        });
    }
}

function initGoogleAuthBtn() {
    const customBtn = document.getElementById("googleLoginBtn");
    if (customBtn) {
        customBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const originalText = customBtn.innerHTML;
            customBtn.innerHTML = "<span>Redirecting...</span>";
            customBtn.disabled = true;

            // Uses API_BASE securely parsed from api.js
            window.location.href = `${API_BASE}/api/auth/google`;
        });
    }
}

// Global utility wrapper
window.handleLogout = () => authUtil.logout();
