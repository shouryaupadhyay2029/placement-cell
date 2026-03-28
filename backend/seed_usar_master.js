const mongoose = require("mongoose");
require("dotenv").config();
const Company = require("./models/Company");
const BatchSummary = require("./models/BatchSummary");

async function seedUSARMaster() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🚀 Restoring USAR Institutional Data...");

        // 1. CLEAR USAR (Only USAR!)
        await Company.deleteMany({ college: "USAR", batch_year: { $in: ["2024", "2025"] } });
        await BatchSummary.deleteMany({ college: "USAR", batch_year: { $in: ["2024", "2025"] } });

        // 2. COMPANIES 2025
        const comps2025 = [
            { company_name: "GoDaddy Inc.", batch_year: "2025", role: "SDE Intern", package: "27.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "RT Camp Solutions Pvt. Ltd.", batch_year: "2025", role: "Software Engineer", package: "12.0 LPA", students_placed: 3, status: "Active", college: "USAR" },
            { company_name: "McKinley & Rice Pvt. Ltd.", batch_year: "2025", role: "Business Development Executive", package: "10.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Infosys Ltd.", batch_year: "2025", role: "Specialist Programmer", package: "9.5 LPA", students_placed: 5, status: "Active", college: "USAR" },
            { company_name: "TVS Motor Company", batch_year: "2025", role: "Quality Engineer (Mechatronics)", package: "8.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "RSM USI", batch_year: "2025", role: "Technical Risk Consultant / Associate Consultant", package: "7.7 LPA", students_placed: 5, status: "Active", college: "USAR" },
            { company_name: "Terafac Technologies Pvt. Ltd.", batch_year: "2025", role: "Jr. AIML & Vision Engineer", package: "7.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "Internzvalley Pvt. Ltd.", batch_year: "2025", role: "Business Development Executive", package: "7.0 LPA", students_placed: 11, status: "Active", college: "USAR" },
            { company_name: "Cloud Techner Services Pvt. Ltd.", batch_year: "2025", role: "DevOps Intern", package: "7.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "Cognizant Corporation", batch_year: "2025", role: "Genc Next Select", package: "6.75 LPA", students_placed: 3, status: "Active", college: "USAR" },
            { company_name: "Amar Ujala Ltd.", batch_year: "2025", role: "Data Scientist", package: "6.5 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Infogain Corporation India Ltd.", batch_year: "2025", role: "Associate Software Engineer / Data Science Engineer", package: "6.35 LPA", students_placed: 7, status: "Active", college: "USAR" },
            { company_name: "Genpact Ltd.", batch_year: "2025", role: "DevOps Cloud Consultant / Technical Consultant", package: "6.35 LPA", students_placed: 5, status: "Active", college: "USAR" },
            { company_name: "McKinley & Rice Pvt. Ltd.", batch_year: "2025", role: "Sales Intern / Accounts Manager", package: "6.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "TensorGo Software Technologies", batch_year: "2025", role: "Computer Vision Engineer", package: "6.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "AVL", batch_year: "2025", role: "Software Developer", package: "6.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "RTDS Pvt. Ltd.", batch_year: "2025", role: "Cloud Solutions Consultant", package: "6.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Terafac Technologies Pvt. Ltd.", batch_year: "2025", role: "Jr. Robotics Engineer", package: "6.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "Earth Crust - (Lets Try) Pvt. Ltd.", batch_year: "2025", role: "Data Analyst Intern / UI-UX Intern", package: "6.0 LPA", students_placed: 5, status: "Active", college: "USAR" },
            { company_name: "Capgemini Technology Services India Ltd.", batch_year: "2025", role: "Analyst-2", package: "5.75 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "Publicis Sapient", batch_year: "2025", role: "Quality Engineer", package: "5.1 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Unthinkable Solutions", batch_year: "2025", role: "Software Developer", package: "5.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "High-Technext Engineering & Telecom Pvt. Ltd.", batch_year: "2025", role: "Technical Site Engineer", package: "4.5 LPA", students_placed: 6, status: "Active", college: "USAR" },
            { company_name: "Capgemini Technology Services India Ltd.", batch_year: "2025", role: "Analyst", package: "4.25 LPA", students_placed: 26, status: "Active", college: "USAR" },
            { company_name: "Cognizant Corporation", batch_year: "2025", role: "Genc Select", package: "4.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Infosys Ltd.", batch_year: "2025", role: "Systems Engineer", package: "3.6 LPA", students_placed: 9, status: "Active", college: "USAR" },
            { company_name: "IndiaMart", batch_year: "2025", role: "Field Sales Exec. Intern", package: "3.5 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Physics Wallah", batch_year: "2025", role: "Android developer Intern", package: "0.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Microsoft", batch_year: "2025", role: "Software Engineer", package: "0.0 LPA", students_placed: 1, status: "Active", college: "USAR" }
        ];

        // 3. COMPANIES 2024 (Official Placed List)
        const comps2024 = [
            { company_name: "CVent", batch_year: "2024", role: "Software Engineer", package: "13.69 LPA", students_placed: 0, status: "Active", college: "USAR" },
            { company_name: "RT Camp Solutions", batch_year: "2024", role: "Software Engineer", package: "12.0 LPA", students_placed: 3, status: "Active", college: "USAR" },
            { company_name: "IBM", batch_year: "2024", role: "Technical Associate", package: "11.0 LPA", students_placed: 0, status: "Active", college: "USAR" },
            { company_name: "McKinley Rice", batch_year: "2024", role: "Developer", package: "10.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Infosys Ltd.", batch_year: "2024", role: "Specialist Programmer", package: "9.5 LPA", students_placed: 5, status: "Active", college: "USAR" },
            { company_name: "Afformed Medical Solutions", batch_year: "2024", role: "Engineer", package: "8.0 LPA", students_placed: 0, status: "Active", college: "USAR" },
            { company_name: "RSM USI", batch_year: "2024", role: "Consultant", package: "7.7 LPA", students_placed: 5, status: "Active", college: "USAR" },
            { company_name: "Terafac Technologies", batch_year: "2024", role: "Engineer", package: "7.0 LPA", students_placed: 3, status: "Active", college: "USAR" },
            { company_name: "Infogain", batch_year: "2024", role: "Software Engineer", package: "6.35 LPA", students_placed: 7, status: "Active", college: "USAR" },
            { company_name: "Genpact Ltd.", batch_year: "2024", role: "Developer", package: "6.3 LPA", students_placed: 5, status: "Active", college: "USAR" },
            { company_name: "AVL", batch_year: "2024", role: "Software Engineer", package: "6.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "McKinley Rice", batch_year: "2024", role: "Developer", package: "6.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "RTDS", batch_year: "2024", role: "Consultant", package: "6.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "TensorGo Software", batch_year: "2024", role: "Engineer", package: "6.0 LPA", students_placed: 2, status: "Active", college: "USAR" },
            { company_name: "Capgemini Ltd.", batch_year: "2024", role: "Analyst", package: "5.75 LPA", students_placed: 3, status: "Active", college: "USAR" },
            { company_name: "Lakshmikumaran Sridharan Attorneys", batch_year: "2024", role: "Associate", package: "5.4 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Publicis Sapient", batch_year: "2024", role: "Engineer", package: "5.1 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Unthinkable Solutions", batch_year: "2024", role: "Developer", package: "5.0 LPA", students_placed: 1, status: "Active", college: "USAR" },
            { company_name: "Capgemini Ltd.", batch_year: "2024", role: "Analyst", package: "4.25 LPA", students_placed: 28, status: "Active", college: "USAR" },
            { company_name: "Infosys Ltd.", batch_year: "2024", role: "System Engineer", package: "3.5 LPA", students_placed: 16, status: "Active", college: "USAR" }
        ];

        await Company.insertMany([...comps2025, ...comps2024]);
        console.log("✅ Seeded USAR Companies.");

        // 4. SUMMARIES (The Official report stats)
        const summaries = [
            {
                college: "USAR",
                batch_year: "2025",
                highest_package: 27,
                average_package: 6.11,
                median_package: 6,
                total_offers: 115,
                placement_rate: 45.81,
                total_companies: 80,
                companies_offered: 26,
                actively_participated: 251,
                total_students: 501,
                is_official: true,
                branch_rates: [
                    { name: "AI & DS", rate: 31 },
                    { name: "IIOT", rate: 29 },
                    { name: "AI & ML", rate: 26 },
                    { name: "A & R", rate: 14 }
                ],
                branch_highest: [
                    { name: "AI & Data Science", value: 12.0 },
                    { name: "AI & Machine Learning", value: 12.0 },
                    { name: "Industrial Internet of Things", value: 27.0 },
                    { name: "Automation & Robotics", value: 8.0 }
                ],
                branch_average: [
                    { name: "AI & Data Science", value: 6.33 },
                    { name: "AI & Machine Learning", value: 6.16 },
                    { name: "Industrial Internet of Things", value: 5.88 },
                    { name: "Automation & Robotics", value: 5.95 }
                ],
                branch_median: [
                    { name: "AI & Data Science", value: 6.35 },
                    { name: "AI & Machine Learning", value: 6.0 },
                    { name: "Industrial Internet of Things", value: 4.5 },
                    { name: "Automation & Robotics", value: 6.0 }
                ]
            },
            {
                college: "USAR",
                batch_year: "2024",
                highest_package: 13.69,
                average_package: 5.58,
                total_offers: 88,
                placement_rate: 40.2,
                total_companies: 23,
                is_official: true
            }
        ];

        await BatchSummary.insertMany(summaries);
        console.log("✅ Seeded USAR Institutional Summaries.");

        console.log("🌟 USAR RESTORATION COMPLETE!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seedUSARMaster();
