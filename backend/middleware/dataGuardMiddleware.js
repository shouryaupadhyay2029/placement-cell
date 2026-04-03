/**
 * dataGuardMiddleware.js - Production Safety Guard
 * Forces read-only mode by default and disables all mutations
 */
const dataGuard = (req, res, next) => {
    const method = req.method;

    // Allow all GET requests
    if (method === "GET") {
        return next();
    }

    // mutations require strict ADMIN_KEY verification from environment
    const adminKey = req.headers["x-admin-key"];
    const secureKey = process.env.ADMIN_KEY || "lockdown_active"; 

    if (!adminKey || adminKey !== secureKey) {
        return res.status(403).json({
            success: false,
            message: "Data is locked (read-only mode)",
            error: "Accidental or unauthorized data mutation is prevented by the Data Integrity Shield."
        });
    }

    next();
};

module.exports = { dataGuard };
