const mongoose = require("mongoose");
require("dotenv").config();

// Load model
const PlacementStats = require("./models/PlacementStats");

async function seedPlacements() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for PlacementStats Seeding...");

        const placement2015 = [
            { company_name: "Snapdeal", package_lpa: "15.25", package_numeric: 15.25, offers: 4, year: 2015, college: "USICT" },
            { company_name: "Adobe", package_lpa: "8.50", package_numeric: 8.5, offers: 3, year: 2015, college: "USICT" },
            { company_name: "Capital IQ", package_lpa: "6.70", package_numeric: 6.7, offers: 3, year: 2015, college: "USICT" },
            { company_name: "Azcom Infosolution", package_lpa: "6.50", package_numeric: 6.5, offers: 4, year: 2015, college: "USICT" },
            { company_name: "Practo", package_lpa: "6.47", package_numeric: 6.47, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Indus Valley Partners(India)", package_lpa: "6.00", package_numeric: 6, offers: 4, year: 2015, college: "USICT" },
            { company_name: "Zillious", package_lpa: "6.00", package_numeric: 6, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Interaa", package_lpa: "6.00", package_numeric: 6, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Paytm", package_lpa: "5", package_numeric: 5, offers: 4, year: 2015, college: "USICT" },
            { company_name: "Revel", package_lpa: "4.50", package_numeric: 4.5, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Nagarro", package_lpa: "4.00", package_numeric: 4, offers: 7, year: 2015, college: "USICT" },
            { company_name: "Vinsol", package_lpa: "4.00", package_numeric: 4, offers: 3, year: 2015, college: "USICT" },
            { company_name: "Intelligrape", package_lpa: "3.50", package_numeric: 3.5, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Times Internet", package_lpa: "3-5", package_numeric: 4, offers: 5, year: 2015, college: "USICT" },
            { company_name: "ESSE XLG", package_lpa: "3-5", package_numeric: 4, offers: 2, year: 2015, college: "USICT" },
            { company_name: "TCS", package_lpa: "3.25", package_numeric: 3.25, offers: 127, year: 2015, college: "USICT" },
            { company_name: "AVL", package_lpa: "3.25", package_numeric: 3.25, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Techmahindra", package_lpa: "3.07", package_numeric: 3.07, offers: 12, year: 2015, college: "USICT" },
            { company_name: "Polestar", package_lpa: "3.00", package_numeric: 3, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Eninov", package_lpa: "3.00", package_numeric: 3, offers: 1, year: 2015, college: "USICT" },
            { company_name: "Aon Hewwit", package_lpa: "2.80", package_numeric: 2.8, offers: 4, year: 2015, college: "USICT" }
        ];

        const placement2016 = [
            { company_name: "Adobe", package_lpa: "10.00", package_numeric: 10, offers: 5, year: 2016, college: "USICT" },
            { company_name: "Opera Solutions", package_lpa: "6.00", package_numeric: 6, offers: 5, year: 2016, college: "USICT" },
            { company_name: "Octro", package_lpa: "5-7", package_numeric: 6, offers: 6, year: 2016, college: "USICT" },
            { company_name: "Vinsol", package_lpa: "5.5", package_numeric: 5.5, offers: 5, year: 2016, college: "USICT" },
            { company_name: "Compro", package_lpa: "5.30", package_numeric: 5.3, offers: 1, year: 2016, college: "USICT" },
            { company_name: "ISS Retails", package_lpa: "4.50", package_numeric: 4.5, offers: 1, year: 2016, college: "USICT" },
            { company_name: "Nagarro", package_lpa: "4.00", package_numeric: 4, offers: 5, year: 2016, college: "USICT" },
            { company_name: "Aricent", package_lpa: "3.50", package_numeric: 3.5, offers: 54, year: 2016, college: "USICT" },
            { company_name: "AVL", package_lpa: "3.50", package_numeric: 3.5, offers: 4, year: 2016, college: "USICT" },
            { company_name: "TCS", package_lpa: "3.33", package_numeric: 3.33, offers: 125, year: 2016, college: "USICT" },
            { company_name: "YAMAHA MOTORS", package_lpa: "3.30", package_numeric: 3.3, offers: 4, year: 2016, college: "USICT" },
            { company_name: "Wipro", package_lpa: "3.25", package_numeric: 3.25, offers: 36, year: 2016, college: "USICT" },
            { company_name: "Adobe For Training", package_lpa: "0.25 PM", package_numeric: 3, offers: 1, year: 2016, college: "USICT" }
        ];

        // Combine
        const allStats = [...placement2015, ...placement2016];

        // Delete existing for USICT if any
        await PlacementStats.deleteMany({ college: "USICT" });
        
        const result = await PlacementStats.insertMany(allStats);
        console.log(`Successfully seeded ${result.length} PlacementStats for USICT.`);

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seedPlacements();
