/**
 * api.js - Simple Fetch Wrapper for Backend Communication
 * Handles JWT inclusion in headers automatically.
 */

// Smart API base URL detection
const API_BASE_URL = (window.location.port !== '5000') 
    ? "http://localhost:5000" 
    : "";

const api = {
    /**
     * Reusable fetch function
     * @param {string} endpoint - API route (e.g. "/auth/login")
     * @param {object} options - Fetch options (method, headers, body)
     */
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem("token");

        // Set default headers
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        // 3. AUTH TOKEN HANDLING - Attach Bearer Token automatically
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const url = `${API_BASE_URL}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // 8. ERROR HANDLING - Catch 401 Unauthorized globally
            if (response.status === 401) {
                console.warn("Session expired or unauthorized access.");
                // Optional: handleLogout() if already on a protected page
            }

            return response;
        } catch (error) {
            console.error("Connection Error:", error);
            throw error;
        }
    },

    // GET Request
    async get(endpoint) {
        return this.fetch(endpoint, { method: "GET" });
    },

    // POST Request
    async post(endpoint, body) {
        return this.fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(body)
        });
    }
};

// Export to window
window.api = api;
