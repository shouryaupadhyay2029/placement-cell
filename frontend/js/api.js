/**
 * api.js - Simple Fetch Wrapper for Backend Communication
 * Handles JWT inclusion in headers automatically.
 */

// Centralized API Base URL Configuration
const API_BASE = "https://placepro-backend.onrender.com";

const API_BASE_URL = `${API_BASE}/api`;

const api = {
    /**
     * Reusable fetch function
     */
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        const college = localStorage.getItem("college") || "USAR";

        const headers = {
            "Content-Type": "application/json",
            "X-College-Context": college,
            "x-college": college,
            ...options.headers
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        let finalEndpoint = endpoint;
        if (!finalEndpoint.includes("college=")) {
            const separator = finalEndpoint.includes("?") ? "&" : "?";
            finalEndpoint = `${finalEndpoint}${separator}college=${college}`;
        }

        const url = `${API_BASE_URL}${finalEndpoint}`;

        // VERIFY API CALL (Step 1)
        if (window.location.hostname === "localhost") {
            console.log(`🚀 CALLING API: ${url}`, { options });
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (window.location.hostname === "localhost") {
                console.log(`📡 Response status: ${response.status} for ${endpoint}`);
            }

            const data = await response.clone().json().catch(() => ({}));

            // Handle Error Response (Step 2)
            if (!response.ok || data.success === false) {
                const errorMsg = data.error || data.message || "An unknown operational failure occurred";
                console.error(`❌ API ERROR in ${endpoint}:`, errorMsg);

                // Show floating message if the utility exists
                if (typeof showMessage === 'function') {
                    showMessage(errorMsg, "error");
                }
            }

            // DEBUG LOG (Standardized)
            if (window.location.hostname === "localhost" && response.ok) {
                console.log(`✅ ${endpoint} Data:`, data);
            }

            if (response.status === 401 && (window.location.pathname.includes('eligibility.html') || window.location.pathname.includes('admin'))) {
                if (typeof handleLogout === 'function') handleLogout("Your session has expired.");
            }

            return response;
        } catch (error) {
            console.error(`🚨 Network Error for ${endpoint}:`, error.message);
            throw error;
        }
    },

    async get(endpoint) {
        return this.fetch(endpoint, { method: "GET" });
    },

    async post(endpoint, body) {
        return this.fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(body)
        });
    }
};

window.api = api;
