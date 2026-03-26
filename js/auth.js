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
            else window.location.href = "web.html";
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
            console.error("Google SDK load timeout");
        }
    }, 100);
}

function initGoogleAuth() {
    console.log("Initializing Google UI for Origin:", window.location.origin);
    
    // Safety check: Google GIS does not work with file:// protocol
    if (window.location.protocol === 'file:') {
        const errorMsg = "CRITICAL: Google Auth requires a web server (http). Open via http://localhost:5000/html/web.html";
        showToast("Error: Please open the app via the server URL, not the file system.", "error");
        return;
    }

    try {
        // Redundant initialize removed as it's handled by <div id="g_id_onload"> in web.html
        // But we still need to hook the custom button
        const customBtn = document.getElementById("googleLoginBtn");
        if (customBtn) {
            customBtn.onclick = (e) => {
                e.preventDefault();
                console.log("Google Button Clicked. Current Client ID:", GOOGLE_CLIENT_ID);
                
                // Show a mini-loader or change button text
                const originalText = customBtn.innerHTML;
                customBtn.innerHTML = "<span>Connecting...</span>";
                customBtn.disabled = true;

                // Trigger the native Google account picker
                google.accounts.id.prompt((notification) => {
                    console.log("--- Google Prompt Status Update ---");
                    console.log("Moment Type:", notification.getMomentType());
                    
                    if (notification.isNotDisplayed()) {
                        const reason = notification.getNotDisplayedReason();
                        console.warn("Prompt suppressed. Reason:", reason);
                        
                        // Handle suppression reasons
                        if (reason === 'skipped_by_user') {
                            showToast("You closed the Google prompt. Click again to reopen.", "info");
                        } else if (reason === 'opt_out_or_no_session') {
                            showToast("Please ensure you are signed in to Google in this browser.", "warning");
                        } else if (reason === 'suppressed_by_user') {
                            showToast("Google Login is suppressed. Try refreshing the page.", "error");
                        } else {
                            showToast("Google login could not be displayed: " + reason, "error");
                        }
                        
                        // Reset button
                        customBtn.innerHTML = originalText;
                        customBtn.disabled = false;
                    } 
                    
                    if (notification.isSkippedMoment()) {
                        console.warn("Prompt skipped. Reason:", notification.getSkippedReason());
                        customBtn.innerHTML = originalText;
                        customBtn.disabled = false;
                    }

                    if (notification.isDismissedMoment()) {
                        console.log("Prompt dismissed by user.");
                        customBtn.innerHTML = originalText;
                        customBtn.disabled = false;
                    }
                });

                // Fail-safe to reset button after 5 seconds if no response
                setTimeout(() => {
                    if (customBtn.disabled) {
                        customBtn.innerHTML = originalText;
                        customBtn.disabled = false;
                    }
                }, 5000);
            };
        }
    } catch (err) {
        console.error("Google SDK Initialization Error:", err);
        showToast("Google Auth error. Please try again later.", "error");
    }
}

/**
 * --- 4. GOOGLE CALLBACK ---
 */
async function handleGoogleLogin(response) {
    if (!response.credential) return;

    try {
        console.log("Sending Google credential to backend...");
        const res = await window.api.post("/auth/google-login", {
            credential: response.credential
        });
        const data = await res.json();

        if (data.success) {
            processLoginSuccess(data);
        } else {
            showToast("Google Login Failed: " + (data.message || "Unauthorized"), "error");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Google connection error.", "error");
    }
}

window.handleGoogleLogin = handleGoogleLogin;

/**
 * Shared Success Handler
 */
function processLoginSuccess(data) {
    const user = data.user || data;

    if (!data.token) {
        console.error("Auth Success but NO TOKEN received.");
        return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        branch: user.branch || "",
        year: user.year || "",
        picture: user.picture || ""
    }));

    const authModal = document.getElementById("authModal");
    if (authModal) authModal.classList.remove("show");

    showToast("Login Successful! Welcome, " + (user.name || "User"), "success");

    initAuthAndProfile();
}

async function initAuthAndProfile() {
    const token = localStorage.getItem("token");
    const protectedPages = ["students.html", "companies.html"];
    const isProtected = protectedPages.some(page => window.location.pathname.includes(page));

    if (!token) {
        if (isProtected) {
            showToast("Unauthorized. Please login.", "error");
            setTimeout(() => { window.location.href = "web.html"; }, 1000);
            return;
        }
        updateUIForGuest();
        return;
    }

    try {
        const response = await window.api.get("/auth/profile");
        const user = await response.json();
        if (response.ok) updateUIForUser(user);
        else if (response.status === 401) handleLogout("Session expired. Please log in again.");
        else updateUIForGuest();
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

    if (avatarEl && user.picture) {
        avatarEl.innerHTML = `<img src="${user.picture}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }

    const adminBadge = document.getElementById("adminBadge");
    const adminElements = document.querySelectorAll(".admin-only");

    if (user.role === "admin") {
        if (adminBadge) adminBadge.style.display = "inline-block";
        adminElements.forEach(el => el.style.display = "table-cell");
        adminElements.forEach(el => { if (el.tagName !== "TH" && el.tagName !== "TD") el.style.display = "block"; });
    } else {
        if (adminBadge) adminBadge.style.display = "none";
        adminElements.forEach(el => el.style.display = "none");
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
}

function handleLogout(message = null) {
    if (message) showToast(message, "info");
    else showToast("You have been logged out successfully.", "success");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    const protectedPages = ["students.html", "companies.html"];
    const isProtected = protectedPages.some(page => window.location.pathname.includes(page));
    setTimeout(() => {
        if (isProtected) window.location.href = "web.html";
        else updateUIForGuest();
    }, 1200);
}

window.addEventListener("click", (e) => {
    if (e.target.id === "logoutBtn") handleLogout();
});
