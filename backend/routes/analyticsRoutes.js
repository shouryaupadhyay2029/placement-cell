const express = require("express");
const { getSummary, getAnalytics } = require("../services/dataService");

const router = express.Router();

/**
 * --- ANALYTICS ROUTE ---
 * Serves placement metrics and distribution charts from data.json
 */
router.get("/", (req, res) => {
    // If mounted at /api/analytics, this handles GET /api/analytics
    const college = req.query.college || req.college;
    const batch = req.query.batch || req.query.batch_year;

    if (!college || !batch) {
        return res.status(400).json({ success: false, message: "College and batch are required" });
    }

    const summary = getSummary(college, batch);
    const analytics = getAnalytics(college, batch);
    const companies = require("../services/dataService").getCompanies(college, batch);

    if (!summary || !analytics) {
        return res.status(404).json({
            success: false,
            message: `No analytics found for ${college} ${batch}`
        });
    }

    // Dynamic Batch Distribution (Across all batches of this college)
    const allBatches = require("../services/dataService").getBatches(college);
    const batchDistribution = {};
    allBatches.forEach(b => {
        const s = getSummary(college, b);
        if (s) batchDistribution[b] = s.companiesVisited || 0;
    });

    // Dynamic Company Type Distribution (For current batch)
    const typeDistribution = {};
    companies.forEach(c => {
        const type = c.company_type || "Other";
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    // Merge for backward compatibility with frontend expectations
    res.json({
        success: true,
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

module.exports = router;
