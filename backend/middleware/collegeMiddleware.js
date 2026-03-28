/**
 * collegeMiddleware.js - Enforce strict data isolation
 */

const enforceCollege = (req, res, next) => {
    // 1. Ensure body exists to avoid crashes
    if (!req.body) req.body = {};

    // 2. Extract context from Header, Query, or Body
    const college = req.headers["x-college"] 
                 || req.headers["x-college-context"] 
                 || req.query?.college 
                 || req.body?.college;

    // 3. Strict Validation
    if (!college || !["USAR", "USICT"].includes(college.toString().toUpperCase())) {
        console.warn(`[SECURITY] Context Rejected: ${req.originalUrl} | Detected: ${college}`);
        return res.status(400).json({
            success: false,
            error: "Action Blocked: Valid College Context (USAR/USICT) is required."
        });
    }

    // 4. Normalize and inject into request
    req.college = college.toString().toUpperCase();
    next();
};

module.exports = { enforceCollege };
