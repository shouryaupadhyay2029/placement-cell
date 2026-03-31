const mongoose = require("mongoose");
const Company = require("./models/Company");
require("dotenv").config();

async function addCapgemini() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const capgemini = {
            company_name: "Capgemini",
            batch_year: "2025",
            role: "Software Engineering Associate",
            package: "4.5 - 7.5 LPA",
            location: "Pan India",
            min_cgpa: 6.5,
            allowed_branches: "All branches eligible (B.E / B.Tech / M.Tech / MCA)",
            backlog_criteria: "No active backlogs allowed",
            selection_process: "Aptitude Test > Game-based Psychometric > Technical Interview > HR Interview",
            eligibility: "Minimum 65% throughout (10th, 12th, UG/PG)",
            description: "Capgemini — Company Overview. Core Subjects: DSA, OS, CN, DBMS. Tools: Git, Unit Testing. Cloud: AWS/Azure.",
            company_type: "Service-based",
            college: "USAR",
            status: "Upcoming",
            deadline: "TBD"
        };

        const result = await Company.findOneAndUpdate(
            { company_name: "Capgemini", batch_year: "2025", college: "USAR" },
            capgemini,
            { upsert: true, new: true }
        );

        console.log("✅ Capgemini added successfully:", result._id);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding Capgemini:", error);
        process.exit(1);
    }
}

addCapgemini();
