const express = require("express");
const Company = require("../models/Company");
const Student = require("../models/Student");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

const parsePackage = (pkgStr) => {
    if (!pkgStr) return 0;
    // Handle things like "15.25 LPA", "3 to 5 LPA", "5+", "25000/- PM"
    if (typeof pkgStr === 'number') return pkgStr;
    const match = pkgStr.match(/(\d+(\.\d+)?)/);
    if (!match) return 0;

    let val = parseFloat(match[1]);
    // If it's a monthly stipend (like PM in the USICT matrix), convert to LPA equivalent for averaging
    if (pkgStr.includes("PM") || pkgStr.includes("per month")) {
        return (val * 12) / 100000;
    }
    return val;
};

const BatchSummary = require("../models/BatchSummary");

// @desc    Get dynamic analytics from Database (Unified for all colleges)
// @route   GET /api/companies/analytics
router.get("/analytics", async (req, res) => {
    try {
        const { batch_year } = req.query;
        const college = req.college;
        const query = { college };
        if (batch_year && batch_year !== "all") query.batch_year = batch_year;

        const companies = await Company.find(query);
        const totalCompanies = companies.length;

        // Fetch Official Summary once at the start if batch_year is provided
        const officialSummary = (batch_year && batch_year !== "all")
            ? await BatchSummary.findOne({ college, batch_year })
            : null;

        // Sum of students_placed across all companies in the query
        const calculatedPlaced = companies.reduce((acc, curr) => acc + (curr.students_placed || 0), 0);

        // Packages Analysis
        const packages = companies.map(c => parsePackage(c.package)).filter(p => p > 0);
        const calculatedHighest = packages.length > 0 ? Math.max(...packages) : 0;
        const calculatedAvg = packages.length > 0 ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2) : 0;

        // OFFICIAL STATS OVERRIDE
        let finalPlaced = calculatedPlaced;
        let finalHighest = calculatedHighest;
        let finalAvg = calculatedAvg;
        let finalRate = calculatedPlaced > 0 ? 100 : 0;
        let finalTotalCompanies = totalCompanies;

        if (officialSummary) {
            finalPlaced = officialSummary.total_offers || calculatedPlaced;
            finalHighest = officialSummary.highest_package || calculatedHighest;
            finalAvg = officialSummary.average_package || calculatedAvg;
            finalRate = officialSummary.placement_rate || 100;
            finalTotalCompanies = officialSummary.total_companies || totalCompanies;
        }

        // Dynamic Distributions
        const allCompaniesForCollege = await Company.find({ college });
        const batchDistribution = {};
        allCompaniesForCollege.forEach(c => {
            batchDistribution[c.batch_year] = (batchDistribution[c.batch_year] || 0) + 1;
        });

        const typeDistribution = {};
        companies.forEach(c => {
            const type = c.company_type || "Software";
            typeDistribution[type] = (typeDistribution[type] || 0) + 1;
        });

        const locationDistribution = {};
        companies.forEach(c => {
            const loc = c.location || "India";
            locationDistribution[loc] = (locationDistribution[loc] || 0) + 1;
        });

        // OFFICIAL TYPE DISTRIBUTION OVERRIDE (Sector-wise)
        let finalTypeDistribution = typeDistribution;
        if (officialSummary && officialSummary.type_distribution && officialSummary.type_distribution.length > 0) {
            finalTypeDistribution = {};
            officialSummary.type_distribution.forEach(d => {
                finalTypeDistribution[d.name] = d.value;
            });
        }

        // Branch Details (from Student records)
        const studentQuery = { college };
        if (batch_year && batch_year !== "all") studentQuery.year = parseInt(batch_year);
        const students = await Student.find(studentQuery);

        const branchDetails = {};
        students.forEach(s => {
            if (!branchDetails[s.branch]) branchDetails[s.branch] = { placed: 0, highest_package: 0, avg_package: 0, total_val: 0 };
            branchDetails[s.branch].placed++;
            const pkg = parsePackage(s.package_str || s.package);
            if (pkg > branchDetails[s.branch].highest_package) branchDetails[s.branch].highest_package = pkg;
            branchDetails[s.branch].total_val += pkg;
            branchDetails[s.branch].avg_package = (branchDetails[s.branch].total_val / branchDetails[s.branch].placed).toFixed(2);
        });

        // Top Companies (Sorted by Highest Package)
        const topCompanies = companies
            .map(c => ({
                name: c.company_name,
                role: c.role,
                package_str: c.package,
                package_num: parsePackage(c.package)
            }))
            .sort((a, b) => b.package_num - a.package_num)
            .slice(0, 10);

        // Merge Official Branch Details if available
        console.log(`[API-DEBUG] Official Summary found for ${college}/${batch_year}:`, !!officialSummary);
        if (officialSummary) {
            // If we have an official summary, we should prioritize its metrics over live student data
            // Clear existing branch data to avoid "Unknown" or dirty records from live database
            Object.keys(branchDetails).forEach(key => delete branchDetails[key]);

            console.log(`[API-DEBUG] Summary branch_average count:`, officialSummary.branch_average?.length);
            if (officialSummary.branch_average && officialSummary.branch_average.length > 0) {
                officialSummary.branch_average.forEach(b => {
                    console.log(`[API-DEBUG] Merging ${b.name}: ${b.value}`);
                    if (!branchDetails[b.name]) branchDetails[b.name] = { placed: 0, highest_package: 0, avg_package: 0, total_val: 0 };
                    branchDetails[b.name].avg_package = b.value;
                });
            }
            if (officialSummary.branch_highest && officialSummary.branch_highest.length > 0) {
                officialSummary.branch_highest.forEach(b => {
                    if (!branchDetails[b.name]) branchDetails[b.name] = { placed: 0, highest_package: 0, avg_package: 0, total_val: 0 };
                    branchDetails[b.name].highest_package = b.value;
                });
            }
        }

        console.log(`[API-DEBUG] Branch Details for ${college} ${batch_year}:`, JSON.stringify(branchDetails));

        res.json({
            total_companies: finalTotalCompanies,
            active_companies: 0,
            avg_package: parseFloat(finalAvg),
            highest_package: finalHighest,
            total_placed: finalPlaced,
            placement_rate: finalRate,
            internship_offers: officialSummary?.internship_offers || 0,
            ppo_offers: officialSummary?.ppo_offers || 0,
            median_package: officialSummary?.median_package || 0,
            batch_distribution: batchDistribution,
            type_distribution: finalTypeDistribution,
            location_distribution: locationDistribution,
            top_companies: topCompanies,
            batch_stats: {
                total_placed: finalPlaced,
                companies_visited: finalTotalCompanies,
                branch_details: branchDetails,
                overall_highest_package: finalHighest,
                overall_avg_package: parseFloat(finalAvg),
                internship_offers: officialSummary?.internship_offers || 0,
                ppo_offers: officialSummary?.ppo_offers || 0,
                median_package: officialSummary?.median_package || 0,
                branch_highest: officialSummary?.branch_highest || [],
                branch_average: officialSummary?.branch_average || [],
                branch_median:  officialSummary?.branch_median  || [],
                branch_full:    officialSummary?.branch_full    || [],
                total_students: officialSummary?.total_students || 0,
                actively_participated: officialSummary?.actively_participated || 0,
                companies_offered: officialSummary?.companies_offered || 0
            }
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ message: "Error" });
    }
});

// @desc    Get dynamic recruitment ranking
// @route   GET /api/companies/recruitment
router.get("/recruitment", async (req, res) => {
    try {
        const { batch_year } = req.query;
        const college = req.college;
        const query = { college };
        if (batch_year && batch_year !== "all") query.batch_year = batch_year;

        // Sort by recruitment magnitude
        const companies = await Company.find(query).sort({ students_placed: -1 });

        res.json({
            companies: companies.map(c => c.company_name),
            students_placed: companies.map(c => c.students_placed || 0),
            company_types: companies.map(c => c.company_type || "Services"),
            company_locations: companies.map(c => c.location || "India"),
            total_placed: companies.reduce((a, b) => a + (b.students_placed || 0), 0)
        });
    } catch (error) {
        console.error("Recruitment error:", error);
        res.status(500).json({ message: "Error" });
    }
});

// @desc    Get branch-wise counts
// @route   GET /api/companies/branch-stats
router.get("/branch-stats", async (req, res) => {
    try {
        const { batch_year } = req.query;
        const college = req.college;
        const query = { college };
        if (batch_year && batch_year !== "all") query.year = parseInt(batch_year);

        // SPECIAL CASE: USAR 2025 — use official branch_full data
        if (batch_year && batch_year !== "all") {
            const summary = await BatchSummary.findOne({ college, batch_year });

            if (summary && summary.branch_full && summary.branch_full.length > 0) {
                // Return placed students per branch from official data
                const labels = summary.branch_full.map(b => b.name);
                const counts = summary.branch_full.map(b => b.placed);
                const total = counts.reduce((s, v) => s + v, 0);
                return res.json({
                    labels,
                    counts,
                    total,
                    official_rates: null,
                    is_branch_full: true
                });
            }

            // Fallback: check for branch_rates (USICT style)
            if (summary && summary.branch_rates && summary.branch_rates.length > 0) {
                return res.json({
                    official_rates: summary.branch_rates || [],
                    overall_rate: summary.placement_rate || 0
                });
            }
        }

        const students = await Student.find(query);
        const branchCounts = {};
        students.forEach(s => {
            branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
        });

        res.json({
            labels: Object.keys(branchCounts),
            counts: Object.values(branchCounts),
            total: students.length,
            official_rates: null
        });
    } catch (error) {
        console.error("Branch stats error:", error);
        res.status(500).json({ message: "Error" });
    }
});

// @desc    Get all unique batch years for a college
// @route   GET /api/companies/batches
router.get("/batches", async (req, res) => {
    try {
        const college = req.college;
        console.log(`[API-DEBUG] Batches requested for college: ${college}`);
        const batches = await Company.distinct("batch_year", { college });
        console.log(`[API-DEBUG] Found batches: ${JSON.stringify(batches)}`);
        // Sort descending: 2025, 2024...
        res.json(batches.sort((a, b) => b - a));
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.get("/", async (req, res) => {
    const college = req.college;
    const filter = { college };
    if (req.query.batch_year && req.query.batch_year !== "all") {
        filter.batch_year = req.query.batch_year;
    }
    const companies = await Company.find(filter).sort({ createdAt: -1 });
    res.json(companies);
});

router.post("/", protect, admin, async (req, res) => {
    try {
        const college = req.college;
        const company = await Company.create({ ...req.body, college });
        res.status(201).json(company);
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.put("/:id", protect, admin, async (req, res) => {
    try {
        const college = req.college;
        delete req.body.college; // FORCE ISOLATION: Prevent frontend from overwriting college
        const company = await Company.findOneAndUpdate({ _id: req.params.id, college }, req.body, { new: true });
        if (!company) return res.status(404).json({ message: "Company not found" });
        res.json(company);
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const college = req.college;
        const company = await Company.findOneAndDelete({ _id: req.params.id, college });
        if (!company) return res.status(404).json({ message: "Company not found" });
        res.json({ message: "Company removed" });
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.post("/apply/:id", protect, async (req, res) => {
    try {
        const college = req.college;
        res.json({ success: true, message: "Application submitted for " + college });
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

module.exports = router;
