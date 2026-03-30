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

    // 3. SAFE DEFAULT (Step 2)
    // If college context is missing or invalid, default to "USAR" to prevent breaking the flow
    let finalCollege = "USAR";
    if (college && ["USAR", "USICT"].includes(college.toString().toUpperCase())) {
        finalCollege = college.toString().toUpperCase();
    } else if (college) {
        console.warn(`[CONTEXT] Invalid college "${college}" detected. Defaulting to USAR.`);
    }

    // 4. Normalize and inject into request
    req.college = finalCollege;
    next();
};

module.exports = { enforceCollege };
