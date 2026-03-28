const mongoose = require("mongoose");
require("dotenv").config();
const Company = require("./models/Company");

const updateData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for refinement...");

        // Refine Atlanta Systems - Create two records if they don't exist
        await Company.deleteMany({ company_name: /Atlanta Systems/i, batch_year: "2025" });
        await Company.create([
            {
                company_name: "Atlanta Systems Pvt. Ltd.",
                batch_year: "2025",
                role: "Embedded Testing Engineer",
                package: "₹ 20K / Mo",
                location: "Delhi NCR",
                status: "Closed"
            },
            {
                company_name: "Atlanta Systems Pvt. Ltd.",
                batch_year: "2025",
                role: "AI-ML Intern",
                package: "₹ 10K / Mo",
                location: "Delhi NCR",
                status: "Closed"
            }
        ]);
        console.log("Refined Atlanta Systems to two separate entries (20K & 10K).");

        console.log("Finished refinement.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateData();
