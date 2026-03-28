const express = require("express");
const PlacementStats = require("../models/PlacementStats");

const router = express.Router();

// @desc    Get aggregated placement stats
// @route   GET /api/placements
router.get("/", async (req, res) => {
    try {
        const { year } = req.query;
        const college = req.college;
        console.log("Placement Data Request - College:", college, "Year:", year || "Overall");
        let query = { college };
        
        if (year) query.year = parseInt(year);

        const stats = await PlacementStats.find(query).sort({ year: -1 });
        
        // Calculate basic aggregates for dashboard
        if (stats.length > 0) {
            const totalOffers = stats.reduce((acc, curr) => acc + curr.offers, 0);
            const totalCompanies = stats.length;
            const packages = stats.map(s => s.package_numeric);
            const highestPackage = Math.max(...packages);
            const avgPackage = (packages.reduce((a, b) => a + b, 0) / totalCompanies).toFixed(2);

            return res.json({
                data: stats,
                summary: {
                    total_offers: totalOffers,
                    total_companies: totalCompanies,
                    highest_package: highestPackage,
                    avg_package: parseFloat(avgPackage)
                }
            });
        }

        res.json({ data: [], summary: { total_offers: 0, total_companies: 0, highest_package: 0, avg_package: 0 } });
    } catch (error) {
        console.error("Fetch placements error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
