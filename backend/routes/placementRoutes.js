const express = require("express");
const { getSummary, getAnalytics } = require("../services/dataService");

const router = express.Router();

/**
 * --- PLACEMENT ROUTES (STABLE LAYER) ---
 * Serves aggregated stats and summary metrics from data.json
 */

// @desc    Get aggregated placement summary metrics
// @route   GET /api/placements/summary
router.get("/summary", (req, res) => {
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;

    if (!college || !batch) {
        return res.status(400).json({ success: false, message: "College and batch are required" });
    }

    const data = getSummary(college, batch);

    if (!data) {
        return res.json({
            success: false,
            message: "No summary found for selected college and batch"
        });
    }

    res.json({ success: true, data });
});

// @desc    Redirect for legacy stats endpoint
// @route   GET /api/placements
router.get("/", (req, res) => {
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;
    
    const summary = getSummary(college, batch);
    const companies = require("../services/dataService").getCompanies(college, batch);

    // Maintain historical data summary structure
    res.json({
        data: companies,
        summary: {
            total_offers: summary?.studentsPlaced || 0,
            total_companies: summary?.companiesVisited || 0,
            highest_package: summary?.highestPackage || 0,
            avg_package: summary?.averagePackage || 0
        }
    });
});

module.exports = router;
