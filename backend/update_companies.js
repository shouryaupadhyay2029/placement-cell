const mongoose = require("mongoose");
require("dotenv").config();
const Company = require("./models/Company");

const updateData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Update Atlanta Systems
        // The user says: "Atlanta Systems offered 20k permonth & 10k per month not 6lpa"
        // This implies two different roles/offers, or just updating the existing one(s).
        // Let's find companies with "Atlanta Systems"
        const atlanta = await Company.find({ company_name: /Atlanta Systems/i, batch_year: "2025" });
        console.log(`Found ${atlanta.length} Atlanta records`);
        
        for (const comp of atlanta) {
            if (comp.package.includes("6")) {
                comp.package = "₹ 20K / Mo & ₹ 10K / Mo";
                await comp.save();
                console.log("Updated Atlanta Systems package");
            }
        }

        // 2. Update The Economic Times
        // The user says: "The Economic Times offered 10k per month stipend not 1.2lpa"
        const et = await Company.findOne({ company_name: /Economic Times/i, batch_year: "2025" });
        if (et) {
            et.package = "₹ 10K / Mo (Stipend)";
            await et.save();
            console.log("Updated The Economic Times package");
        } else {
            console.log("Economic Times not found, creating it...");
            await Company.create({
                company_name: "The Economic Times (TOI Group)",
                batch_year: "2025",
                role: "Delegate Acquisition Intern",
                package: "₹ 10K / Mo (Stipend)",
                location: "Noida / Remote",
                status: "Closed"
            });
        }

        // 3. Update Earth Crust
        // The user says: "earth crust offered two6lpa offers one for Data Analyst Intern & other for UI-UX Intern"
        // Let's check existing Earth Crust records
        const ec = await Company.find({ company_name: /Earth Crust/i, batch_year: "2025" });
        console.log(`Found ${ec.length} Earth Crust records`);

        // Remove old Earth Crust records for 2025 to avoid confusion, and create exactly 2
        await Company.deleteMany({ company_name: /Earth Crust/i, batch_year: "2025" });
        
        await Company.create([
            {
                company_name: "Earth Crust - (Lets Try) Pvt. Ltd.",
                batch_year: "2025",
                role: "Data Analyst Intern",
                package: "6 LPA",
                location: "Delhi NCR",
                status: "Closed"
            },
            {
                company_name: "Earth Crust - (Lets Try) Pvt. Ltd.",
                batch_year: "2025",
                role: "UI-UX Intern",
                package: "6 LPA",
                location: "Delhi NCR",
                status: "Closed"
            }
        ]);
        console.log("Updated Earth Crust records to two 6 LPA offers");

        console.log("Finished updating database.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateData();
