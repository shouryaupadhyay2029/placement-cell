const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/data.json");

/**
 * --- DATA SERVICE (SINGLE SOURCE OF TRUTH) ---
 * All placement-related data (companies, summary, analytics, eligibility)
 * is served from data.json to ensure stability and prevent corruption.
 */

function deepFreeze(obj) {
    Object.keys(obj).forEach(prop => {
        if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
}

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
            message: "PRODUCTION LOCK ACTIVE: Data modifications are disabled in this environment.",
            error: "Accidental or unauthorized data mutation is prevented by the Data Integrity Shield."
        });
    }

    next();
};

module.exports = { lockPlacementData: dataGuard };

function loadData() {
    try {
        const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
        // Deep freeze to prevent ANY in-memory mutations
        return deepFreeze(raw);
    } catch (error) {
        console.error("Critical: Failed to load data.json", error);
        return {};
    }
}

function getCollegeData(college, batch) {
    const data = loadData();
    const collegeKey = (college || "").toUpperCase();
    const batchKey = batch ? String(batch) : null;
    
    if (!data[collegeKey]) return null;
    
    const context = batchKey ? data[collegeKey][batchKey] : data[collegeKey];
    
    // Step 5: Strict Response Validation
    if (batchKey && (!context || !context.summary || !context.companies)) {
        console.error(`Data integrity error for ${collegeKey} ${batchKey}`);
        return null;
    }
    
    return context;
}

function getCompanies(college, batch) {
    const batchData = getCollegeData(college, batch);
    return batchData?.companies || [];
}

function getSummary(college, batch) {
    const batchData = getCollegeData(college, batch);
    return batchData?.summary || null;
}

function getAnalytics(college, batch) {
    const batchData = getCollegeData(college, batch);
    return batchData?.analytics || null;
}

function getEligibility(college, batch) {
    const batchData = getCollegeData(college, batch);
    return batchData?.eligibility || [];
}

function getBatches(college) {
    const collegeData = getCollegeData(college);
    if (!collegeData) return [];
    return Object.keys(collegeData).sort((a, b) => b - a);
}

module.exports = {
    getCompanies,
    getSummary,
    getAnalytics,
    getEligibility,
    getBatches
};
