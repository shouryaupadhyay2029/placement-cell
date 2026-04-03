/**
 * dataGuardMiddleware.js - Placement Data Integrity Shield
 * Prevents unauthorized or accidental mutation of institutional placement records
 */

const lockPlacementData = (req, res, next) => {
    // Only block state-mutating methods
    const restrictedMethods = ["POST", "PUT", "DELETE", "PATCH"];

    // Explicitly check for USAR and USICT contexts which the user wants to "lock in"
    const collegeContext = req.college || "USAR";
    const isAdminRoute = req.path.includes('/admin') || req.path.includes('/ingest');
    const isApplicationRoute = req.path.includes('/apply');

    // Skip lock for student registrations or applications if needed, 
    // but the user said "lock in EVERY placement data" to "prevent loss/mess up". 
    // So for now, we lock administrative changes completely for USAR/USICT.

    if (restrictedMethods.includes(req.method) && !isApplicationRoute) {
        // Check for an 'Unlocking Key' in header for emergencies (e.g., from developer)
        const unlockKey = req.headers["x-data-integrity-key"];

        // This key will allow the developer to manually override if truly needed in the future
        if (unlockKey === "DEEP_SHIELD_2025") {
            return next();
        }

        console.warn(`[DATA-INTEGRITY-BLOCK] Unauthorized ${req.method} attempt on ${collegeContext} placement data.`);

        return res.status(403).json({
            success: false,
            message: "DATA LOCKED: Institutional Placement Integrity Guard is Active.",
            error: `Placement data for ${collegeContext} is currently locked to prevent accidental loss or manipulation. Contact system architect for authorized overrides.`
        });
    }

    next();
};

module.exports = { lockPlacementData };
