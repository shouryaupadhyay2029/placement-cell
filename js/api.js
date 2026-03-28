/**
 * api.js - Simple Fetch Wrapper for Backend Communication
 * Handles JWT inclusion in headers automatically.
 */

// Smart API base URL detection
const API_BASE_URL = (window.location.port !== '5000') 
    ? "http://localhost:5000/api" 
    : "/api";

const api = {
    /**
     * Reusable fetch function
     * @param {string} endpoint - API route (e.g. "/auth/login")
     * @param {object} options - Fetch options (method, headers, body)
     */
    async fetch(endpoint, options = {}) {
        // 1. EXTRACT LOCAL STATE
        const token = localStorage.getItem("token");
        const college = localStorage.getItem("college") || "USAR"; // Default to USAR if missing

        console.log(`[API-DEBUG] Fetching for: ${college} | Endpoint: ${endpoint}`);

        // 2. SET HEADERS (X-College-Context + Auth)
        const headers = {
            "Content-Type": "application/json",
            "X-College-Context": college,
            "x-college": college, // Broad compatibility
            ...options.headers
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // 3. MULTI-COLLEGE CONTEXT - Automatically inject college to query string
        let finalEndpoint = endpoint;
        if (!finalEndpoint.includes("college=")) {
            const separator = finalEndpoint.includes("?") ? "&" : "?";
            finalEndpoint = `${finalEndpoint}${separator}college=${college}`;
        }

        const url = `${API_BASE_URL}${finalEndpoint}`;

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
