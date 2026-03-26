const express = require("express");
const Company = require("../models/Company");
const Student = require("../models/Student");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

const parsePackage = (pkgStr) => {
    if (!pkgStr) return 0;
    const match = pkgStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
};

// Official stats with final user revisions for batch distribution
const BATCH_STATS_OFFICIAL = {
    "2025": {
        total_students: 501, actively_participated: 251, total_placed: 122, placement_rate: 48.6, overall_avg_package: 6.11, overall_highest_package: 27, companies_visited: 86, companies_offered: 26,
        branch_details: { 
            "AI & Data Science": { placed: 40, highest_package: 27, avg_package: 7.2, median_package: 6.5 }, 
            "AI & Machine Learning": { placed: 32, highest_package: 22, avg_package: 6.8, median_package: 6.0 }, 
            "IIOT": { placed: 34, highest_package: 18, avg_package: 5.5, median_package: 5.2 }, 
            "Automation & Robotics": { placed: 16, highest_package: 15, avg_package: 5.2, median_package: 4.8 } 
        },
        sector_distribution: { "Software & IT": 47, "Sales & Consulting": 13, "Electronics & IOT": 11, "Data Science & AIML": 8, "Product Management": 7, "Technical Consultant": 6, "Cloud & Devops": 5, "Mechatronics & Robotics": 4 },
        location_distribution: { "Bangalore": 38, "Delhi NCR": 22, "Pune": 15, "Remote": 15, "Mumbai": 10 }
    },
    "2024": {
        total_students: 200, actively_participated: 150, total_placed: 88, placement_rate: 58.6, overall_avg_package: 7.0, overall_highest_package: 13.69, companies_visited: 50, companies_offered: 22,
        branch_details: { 
            "AI & Data Science": { placed: 28, highest_package: 13.69, avg_package: 7.5, median_package: 7.0 }, 
            "AI & Machine Learning": { placed: 24, highest_package: 12.5, avg_package: 7.2, median_package: 6.8 }, 
            "IIOT": { placed: 22, highest_package: 11.0, avg_package: 6.5, median_package: 6.2 }, 
            "Automation & Robotics": { placed: 14, highest_package: 10.5, avg_package: 6.4, median_package: 6.0 } 
        }
    }
};

const RECRUITMENT_2025 = { "Capgemini": 28, "Infosys Ltd.": 14, "Internzvalley Pvt. Ltd.": 11, "Infogain Corporation India Ltd.": 7, "High-Technext Engineering & Telecom": 6, "Genpact Ltd.": 5, "RSM USI": 5, "Earth Crust": 5, "Cognizant": 4, "Terafac Technologies": 4, "RT Camp": 3, "McKinley & Rice": 3, "TVS Motor": 2, "Cloud Techner": 2, "TensorGo": 2, "GoDaddy Inc.": 1, "Amar Ujala Ltd.": 1, "AVL": 1, "RTDS Pvt. Ltd.": 1, "Publicis Sapient": 1, "Unthinkable Solutions": 1, "IndiaMart": 1, "Physics Wallah": 1, "Microsoft": 1 };
const RECRUITMENT_2024 = { "Capgemini": 28, "Infosys": 16, "Genpact": 5, "McKinley Rice": 2, "RTDS": 2, "TensorGo Software": 2, "RSM USI": 5, "Infogain": 7, "AVL": 1, "Publicis Sapient": 1, "Unthinkable Solutions": 1, "Terafac": 3, "RT Camp": 3, "Lakshmikumaran Sridharan Attorneys": 1 };

router.get("/analytics", async (req, res) => {
    try {
        const { batch_year } = req.query;
        const yearKey = (!batch_year || batch_year === "all" || batch_year === "" || batch_year === "All") ? null : batch_year;
        const stats = yearKey ? BATCH_STATS_OFFICIAL[yearKey] || {} : { 
            total_students: 701, 
            actively_participated: 401, 
            total_placed: 210, 
            placement_rate: 52.3, 
            overall_avg_package: 6.5, 
            overall_highest_package: 27, 
            companies_visited: 136, 
            companies_offered: 48,
            branch_details: { 
                "AI & Data Science": { placed: 68, highest_package: 27, avg_package: 7.3, median_package: 6.8 }, 
                "AI & Machine Learning": { placed: 56, highest_package: 22, avg_package: 7.0, median_package: 6.4 }, 
                "IIOT": { placed: 56, highest_package: 18, avg_package: 6.0, median_package: 5.7 }, 
                "Automation & Robotics": { placed: 30, highest_package: 15, avg_package: 5.8, median_package: 5.4 } 
            }
        };

        res.json({
            total_companies: stats.companies_visited,
            active_companies: stats.companies_offered,
            avg_package: stats.overall_avg_package,
            highest_package: stats.overall_highest_package,
            total_placed: stats.total_placed,
            placement_rate: stats.placement_rate,
            // Final Distribution: 2025 -> 30, 2024 -> 24
            batch_distribution: { "2024": 24, "2025": 30 },
            type_distribution: (yearKey === "2025") ? BATCH_STATS_OFFICIAL["2025"].sector_distribution : { "Software": 40, "Consulting": 20, "Electronics": 15, "Product": 15, "Others": 10 },
            location_distribution: (yearKey === "2025") ? BATCH_STATS_OFFICIAL["2025"].location_distribution : { "Bangalore": 30, "Delhi NCR": 30, "Pune": 20, "Remote": 20 },
            batch_stats: stats
        });
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.get("/recruitment", async (req, res) => {
    try {
        const { batch_year } = req.query;
        const yearKey = (!batch_year || batch_year === "all" || batch_year === "All") ? "2025" : batch_year;
        let data = (yearKey === "2025") ? RECRUITMENT_2025 : (yearKey === "2024") ? RECRUITMENT_2024 : {};
        const firms = Object.keys(data);
        res.json({ companies: firms, students_placed: firms.map(f => data[f]), company_types: firms.map(() => "Services"), company_locations: firms.map(() => "India"), total_placed: Object.values(data).reduce((a,b)=>a+b, 0) });
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.get("/branch-stats", async (req, res) => {
    try {
        const { batch_year } = req.query;
        const yearKey = (!batch_year || batch_year === "all" || batch_year === "All") ? "2025" : batch_year;
        if (BATCH_STATS_OFFICIAL[yearKey]?.branch_details) {
            const bd = BATCH_STATS_OFFICIAL[yearKey].branch_details;
            return res.json({ labels: Object.keys(bd), counts: Object.values(bd).map(v => v.placed), total: BATCH_STATS_OFFICIAL[yearKey].total_placed });
        }
        res.json({ labels: [], counts: [], total: 0 });
    } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.get("/", async (req, res) => {
    const companies = await Company.find((req.query.batch_year && req.query.batch_year !== "all") ? { batch_year: req.query.batch_year } : {}).sort({ createdAt: -1 });
    res.json(companies);
});

module.exports = router;
