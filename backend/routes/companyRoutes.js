const express = require("express");
const { getCompanies, getEligibility, getBatches } = require("../services/dataService");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * --- COMPANY ROUTES (STABLE LAYER) ---
 * All company-related data is served directly from data.json.
 * Any legacy MongoDB logic for companies has been eliminated.
 */

// @desc    Get all companies for a college and batch
// @route   GET /api/companies
router.get("/", (req, res) => {
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;

    if (!college || !batch) {
        return res.status(400).json({ success: false, message: "College and batch are required" });
    }

    const data = getCompanies(college, batch);
    
    // Safety check as requested
    if (!data || data.length === 0) {
        return res.json([]); // Return empty list to maintain array structure
    }

    // Remap for backward compatibility with frontend expectations (e.g. companies.js/web.js)
    const remapped = data.map((c, index) => ({
        ...c,
        id: c.id || index + 1, // Ensure unique ID for frontend keys
        company_name: c.name || c.company_name,
        batch_year: String(c.batch || c.batch_year),
        students_placed: c.offers || c.students_placed || 0,
        eligibility: c.eligibilityText || c.eligibility || "—",
        // Ensure package includes 'LPA' if it's purely numeric for consistent display
        package: (typeof c.package === 'number' || (!isNaN(c.package) && !String(c.package).includes('LPA'))) 
                 ? `${c.package} LPA` 
                 : (c.package || "—")
    }));

    // Returning naked array to maintain backward compatibility with frontend
    res.json(remapped);
});

// @desc    Get all unique batch years for a college
// @route   GET /api/companies/batches
router.get("/batches", (req, res) => {
    const college = req.query.college || req.college;
    const batches = getBatches(college);
    res.json(batches);
});

// @desc    Get eligibility criteria for a specific batch
// @route   GET /api/companies/eligibility
router.get("/eligibility", (req, res) => {
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;

    const data = getEligibility(college, batch);
    res.json({ success: true, data });
});

// @desc    Get placement analytics (Summary Metrics)
// @route   GET /api/companies/analytics
router.get("/analytics", (req, res) => {
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;

    // Delegate to shared analytics logic
    const summary = require("../services/dataService").getSummary(college, batch);
    const analytics = require("../services/dataService").getAnalytics(college, batch);
    const companies = require("../services/dataService").getCompanies(college, batch);

    if (!summary || !analytics) {
        return res.status(404).json({ success: false, message: "No analytics found" });
    }

    // Dynamic Batch Distribution
    const allBatches = require("../services/dataService").getBatches(college);
    const batchDistribution = {};
    allBatches.forEach(b => {
        const s = require("../services/dataService").getSummary(college, b);
        if (s) batchDistribution[b] = s.companiesVisited || 0;
    });

    // Dynamic Company Type Distribution
    const typeDistribution = {};
    companies.forEach(c => {
        const type = c.company_type || "Other";
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    res.json({
        batch_distribution: batchDistribution,
        type_distribution: typeDistribution,
        total_companies: summary.companiesVisited,
        avg_package: summary.averagePackage,
        highest_package: summary.highestPackage,
        total_placed: summary.studentsPlaced,
        placement_rate: summary.placementRate || 0,
        ppo_offers: summary.ppo || 0,
        internship_offers: summary.internships || 0,
        median_package: summary.medianPackage || 0,
        top_companies: (analytics.topCompanies || []).map(c => ({
            ...c,
            name: c.name || c.company_name || "—",
            package_str: (typeof c.package === 'number' || (!isNaN(c.package) && !String(c.package).includes('LPA'))) 
                         ? `${c.package} LPA` 
                         : (c.package || "—"),
            students_placed: c.offers || c.students_placed || 0
        })),
        batch_stats: {
            total_placed: summary.studentsPlaced,
            companies_visited: summary.companiesVisited,
            companies_offered: summary.companiesOffered || 0,
            actively_participated: summary.totalEnrolled || 0,
            overall_highest_package: summary.highestPackage,
            overall_avg_package: summary.averagePackage,
            median_package: summary.medianPackage || 0,
            ppo_offers: summary.ppo || 0,
            internship_offers: summary.internships || 0,
            branch_full: analytics.branchStats || [],
            package_distribution: analytics.packageDistribution || []
        }
    });
});

// @desc    Get recruitment ranking data
// @route   GET /api/companies/recruitment
router.get("/recruitment", (req, res) => {
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;

    const companies = getCompanies(college, batch);
    const sorted = [...companies].sort((a, b) => (b.offers || 0) - (a.offers || 0));

    res.json({
        companies: sorted.map(c => c.name),
        students_placed: sorted.map(c => c.offers || 0),
        company_types: sorted.map(c => c.eligibilityText || "Services"),
        company_locations: sorted.map(c => c.location || "India"),
        total_placed: sorted.reduce((a, b) => a + (b.offers || 0), 0)
    });
});

// @desc    Get branch-wise counts
// @route   GET /api/companies/branch-stats
router.get("/branch-stats", (req, res) => {
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;

    const analytics = require("../services/dataService").getAnalytics(college, batch);
    
    if (analytics && analytics.branchStats && analytics.branchStats.length > 0) {
        const labels = analytics.branchStats.map(b => b.name);
        const counts = analytics.branchStats.map(b => b.placed);
        const rates = analytics.branchStats.map(b => b.rate);
        const total = counts.reduce((s, v) => s + v, 0);
        return res.json({
            labels,
            counts,
            rates,
            total,
            is_branch_full: true
        });
    }

    res.json({ labels: [], counts: [], total: 0 });
});

// Admin-only endpoints locked to prevent data corruption (frozen data.json is truth)
router.post("/", protect, admin, (req, res) => {
    res.status(403).json({ success: false, message: "Data is READ-ONLY. Update data.json manually to ensure stability." });
});

router.put("/:id", protect, admin, (req, res) => {
    res.status(403).json({ success: false, message: "Data is READ-ONLY. Update data.json manually." });
});

router.delete("/:id", protect, admin, (req, res) => {
    res.status(403).json({ success: false, message: "Data is READ-ONLY. Update data.json manually." });
});

// JSON Mode placeholder for frontend-only features
router.post("/apply/:id", protect, (req, res) => {
    res.json({ success: true, message: "Application request logged. (JSON Mode)" });
});

module.exports = router;
