/**
 * collegeMiddleware.js - Enforce strict data isolation
 * Rejects any request that doesn't provide a college context.
 */

const enforceCollege = (req, res, next) => {
    // 1. Extract context from Header, Query, or Body
    const college = req.headers["x-college-context"] || req.query.college || req.body.college;

    if (!college || !["USAR", "USICT"].includes(college.toUpperCase())) {
        console.warn(`[SECURITY] Rejected request to ${req.originalUrl} - Missing/Invalid College Context`);
        return res.status(403).json({
            message: "Action Blocked: Valid College Context (USAR/USICT) is required for this operation."
        });
    }

    // 2. Normalize and inject into request
    req.college = college.toUpperCase();
    console.log(`[CONTEXT] Request: ${req.method} ${req.originalUrl} | College: ${req.college}`);
    next();
};

module.exports = { enforceCollege };
