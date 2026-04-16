/**
 * api.js - Simple Fetch Wrapper for Backend Communication
 * Handles JWT inclusion in headers automatically.
 */

// Centralized API Base URL Configuration
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://placepro-backend.onrender.com";

const API_BASE_URL = `${API_BASE}/api`;

const api = {
    /**
     * Executes a background ping to wake up the Render server upon load.
     */
    warmupServer() {
        if (!this._woke) {
            this._woke = true;
            try {
                const token = localStorage.getItem("token");
                const pingHeaders = { "X-Warmup": "true" };
                if (token) pingHeaders["Authorization"] = `Bearer ${token}`;
                fetch(`${API_BASE_URL}/profile`, { headers: pingHeaders }).catch(() => {});
            } catch(e) {}
        }
    },

    /**
     * Reusable fetch function with Cache, Timeout, and Revalidation built-in.
     */
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        const college = localStorage.getItem("college") || "USAR";
        const method = options.method || "GET";

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
        const cacheKey = `cache_${url}`;

        // VERIFY API CALL (Step 1)
        if (window.location.hostname === "localhost") {
            console.log(`🚀 CALLING API: ${url}`, { options });
        }

        // --- CACHE HANDLING ALGORITHM (GET Only) ---
        if (method === "GET") {
            const cachedObject = localStorage.getItem(cacheKey);
            if (cachedObject) {
                try {
                    const parsedCache = JSON.parse(cachedObject);
                    const ageMs = Date.now() - parsedCache.timestamp;
                    
                    // If cache is fresh (under 5 mins), return immediately to bypass cold start entirely
                    if (ageMs < 5 * 60 * 1000) {
                        if (window.location.hostname === "localhost") console.log(`⚡ SERVER CACHE HIT: ${endpoint}`);
                        
                        // Fire a completely silent background revalidation request so next time we have freshest data
                        if ('requestIdleCallback' in window) {
                            requestIdleCallback(() => this.executeNetworkFetch(url, options, headers, cacheKey, true));
                        } else {
                            setTimeout(() => this.executeNetworkFetch(url, options, headers, cacheKey, true), 500);
                        }

                        // Mock a response object wrapper for the frontend
                        return { ok: true, status: 200, json: async () => parsedCache.data };
                    }
                } catch(e) {
                   localStorage.removeItem(cacheKey);
                }
            }
        }

        // --- NETWORK FETCH EXECUTION ---
        return this.executeNetworkFetch(url, options, headers, method === "GET" ? cacheKey : null, false);
    },
    
    /**
     * Internal actual network dispatch with latency perception management
     */
    async executeNetworkFetch(url, options, headers, cacheKey, backgroundSilent) {
        let timeoutTimer = null;
        
        try {
            // If the user actively requested this (not background), assume Render server might be cold
            if (!backgroundSilent) {
                timeoutTimer = setTimeout(() => {
                    if (typeof showToast === 'function') {
                        showToast("Waking up server... This may take up to 45 seconds on first load.", "info", 5000);
                    }
                }, 3500); // 3.5 seconds to trigger cold start warning
            }

            const response = await fetch(url, { ...options, headers });
            
            if (timeoutTimer) clearTimeout(timeoutTimer);

            if (window.location.hostname === "localhost" && !backgroundSilent) {
                console.log(`📡 Response status: ${response.status} for ${url}`);
            }

            const data = await response.clone().json().catch(() => ({}));

            console.log("API RESPONSE:", data);
            console.log("STATUS:", response.status);

            if (!response.ok) {
                console.error("API failed:", response.status);
            }

            // Handle Error Responses gracefully
            if (!response.ok || data.success === false) {
                const errorMsg = data.error || data.message || "An unknown operational failure occurred";
                if (!backgroundSilent) console.error(`❌ API ERROR in ${url}:`, errorMsg);

                if (typeof showMessage === 'function') showMessage(errorMsg, "error");
            }

            // Cache successfully verified distinct GET responses
            if (response.ok && cacheKey) {
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: data
                }));
            }

            if (response.status === 401 && (window.location.pathname.includes('eligibility.html') || window.location.pathname.includes('admin'))) {
                if (typeof handleLogout === 'function') handleLogout("Your session has expired.");
            }

            return response;
        } catch (error) {
            if (timeoutTimer) clearTimeout(timeoutTimer);
            if (!backgroundSilent) console.error(`🚨 Network Error for ${url}:`, error.message);
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

// Immediately invoke warm-up script using requestIdleCallback to free main thread
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => api.warmupServer());
} else {
    setTimeout(() => api.warmupServer(), 100);
}

window.api = api;
window.API_BASE_URL = API_BASE_URL;
window.API_BASE = API_BASE;
