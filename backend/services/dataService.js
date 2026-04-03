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
    if (batchKey && !data[collegeKey][batchKey]) return null;

    return batchKey ? data[collegeKey][batchKey] : data[collegeKey];
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
