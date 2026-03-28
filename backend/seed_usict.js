const mongoose = require("mongoose");
require("dotenv").config();
const Student = require("./models/Student");
const Company = require("./models/Company");
const BatchSummary = require("./models/BatchSummary");

async function seedUSICT() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for USICT Global Seeding...");

        // USICT 2022 DATA SOURCED FROM PLACEMENT BROCHURE
        const comp2022 = [
            { company_name: "D.E. SHAW", batch_year: "2022", role: "Direct Placement", package: "51.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "SERVICE NOW", batch_year: "2022", role: "Direct Placement", package: "33.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "BROWSERSTACK", batch_year: "2022", role: "Direct Placement", package: "27.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "QUALCOMM", batch_year: "2022", role: "Direct Placement", package: "26.50 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "TEXAS INSTRUMENTS", batch_year: "2022", role: "Direct Placement", package: "25.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "GOLDMAN SACHS", batch_year: "2022", role: "Direct Placement", package: "24.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "BHARAT PE", batch_year: "2022", role: "Direct Placement", package: "22.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "BRIGHTMONEY", batch_year: "2022", role: "Direct Placement", package: "21.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "FRONTROW", batch_year: "2022", role: "Direct Placement", package: "20.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "BIZONGO", batch_year: "2022", role: "Direct Placement", package: "19.50 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "MOENGAGE", batch_year: "2022", role: "Direct Placement", package: "18.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "LEMNISK", batch_year: "2022", role: "Direct Placement", package: "18.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Adobe (Technical)", batch_year: "2022", role: "Technical Staff", package: "45.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Amazon (SDE)", batch_year: "2022", role: "SDE", package: "44.14 LPA", students_placed: 6, status: "Active", college: "USICT" },
            { company_name: "Amazon (SDET)", batch_year: "2022", role: "SDET", package: "31.50 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Amazon (Programmer Analyst)", batch_year: "2022", role: "Analyst", package: "31.31 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Amazon (Data Engineer)", batch_year: "2022", role: "Data Engineer", package: "29.36 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Rapido", batch_year: "2022", role: "Developer", package: "23.00 LPA", students_placed: 9, status: "Active", college: "USICT" },
            { company_name: "Amazon (Support Engineer)", batch_year: "2022", role: "Support Engineer", package: "20.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Tata 1mg", batch_year: "2022", role: "Engineer", package: "18.00 LPA", students_placed: 5, status: "Active", college: "USICT" },
            { company_name: "Josh Technology", batch_year: "2022", role: "Developer", package: "18.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Amazon (QA Engineer)", batch_year: "2022", role: "QA Engineer", package: "17.35 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Adobe (CX)", batch_year: "2022", role: "Customer Experience", package: "15.30 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Mobikwik", batch_year: "2022", role: "Developer", package: "14.50 LPA", students_placed: 9, status: "Active", college: "USICT" },
            { company_name: "Bain & Co.", batch_year: "2022", role: "Consultant", package: "14.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Zenon AI", batch_year: "2022", role: "AI Engineer", package: "13.80 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "JP Morgan (Tavisca)", batch_year: "2022", role: "Associate", package: "13.00 LPA", students_placed: 6, status: "Active", college: "USICT" },
            { company_name: "ZS Associates", batch_year: "2022", role: "Associate", package: "13.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Oracle (High)", batch_year: "2022", role: "Developer", package: "12.60 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Oracle (Standard)", batch_year: "2022", role: "Developer", package: "11.20 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Cvent (ASE)", batch_year: "2022", role: "ASE", package: "11.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Super Six Sports", batch_year: "2022", role: "Developer", package: "11.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "FIS Global", batch_year: "2022", role: "Analyst", package: "10.45 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Alternative Path", batch_year: "2022", role: "Associate", package: "10.00 LPA", students_placed: 7, status: "Active", college: "USICT" },
            { company_name: "Grade Up", batch_year: "2022", role: "Trainee", package: "10.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Indian Shelter Finance", batch_year: "2022", role: "Finance Analyst", package: "10.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Interra Systems", batch_year: "2022", role: "Engineer", package: "10.00 LPA", students_placed: 1, status: "Active", college: "USICT" }
        ];

        // USICT 2021 DATA
        const comp2021 = [
            { company_name: "Amazon (SDE)", batch_year: "2021", role: "SDE", package: "32.00 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "Amazon (Programmer Analyst)", batch_year: "2021", role: "Programmer Analyst", package: "27.83 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "UNIAS Inc.", batch_year: "2021", role: "Direct Placement", package: "20.00 LPA", students_placed: 10, status: "Active", college: "USICT" },
            { company_name: "Amazon (AWS)", batch_year: "2021", role: "AWS", package: "19.00 LPA", students_placed: 5, status: "Active", college: "USICT" },
            { company_name: "Adobe", batch_year: "2021", role: "Direct Placement", package: "12.11 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "rtCamp", batch_year: "2021", role: "Direct Placement", package: "12.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Thorogood", batch_year: "2021", role: "Direct Placement", package: "10.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "ZS Associates", batch_year: "2021", role: "Direct Placement", package: "10.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Cvent", batch_year: "2021", role: "Direct Placement", package: "9.70 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Cvent", batch_year: "2021", role: "Direct Placement", package: "7.05 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "Cvent", batch_year: "2021", role: "Direct Placement", package: "7.00 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "Josh Technology", batch_year: "2021", role: "Direct Placement", package: "8.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Josh Technology", batch_year: "2021", role: "Direct Placement", package: "6.75 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "TCS (Digital)", batch_year: "2021", role: "Digital", package: "7.00 LPA", students_placed: 30, status: "Active", college: "USICT" },
            { company_name: "Yamaha Motors", batch_year: "2021", role: "Direct Placement", package: "7.00 LPA", students_placed: 8, status: "Active", college: "USICT" },
            { company_name: "ClickLabs(JungleWorks)", batch_year: "2021", role: "Direct Placement", package: "7.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Wiley", batch_year: "2021", role: "Direct Placement", package: "7.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Libsys", batch_year: "2021", role: "Direct Placement", package: "7.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Freecharge", batch_year: "2021", role: "Direct Placement", package: "6.70 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Indiamart", batch_year: "2021", role: "Direct Placement", package: "6.00 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "Bravura Solutions", batch_year: "2021", role: "Direct Placement", package: "5.50 LPA", students_placed: 8, status: "Active", college: "USICT" },
            { company_name: "Compunnel Digital", batch_year: "2021", role: "Direct Placement", package: "4.80 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Nagarro", batch_year: "2021", role: "Trainee", package: "4.50 LPA", students_placed: 7, status: "Active", college: "USICT" },
            { company_name: "VectoScalar", batch_year: "2021", role: "Direct Placement", package: "4.50 LPA", students_placed: 5, status: "Active", college: "USICT" },
            { company_name: "NewGen", batch_year: "2021", role: "Direct Placement", package: "4.25 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "PSIT", batch_year: "2021", role: "Direct Placement", package: "4.20 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Tata Advance System Ltd.", batch_year: "2021", role: "Direct Placement", package: "3.99 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "DXC", batch_year: "2021", role: "Associate", package: "3.60 LPA", students_placed: 64, status: "Active", college: "USICT" },
            { company_name: "Media Agility", batch_year: "2021", role: "Direct Placement", package: "3.60 LPA", students_placed: 9, status: "Active", college: "USICT" },
            { company_name: "TCS (Ninja)", batch_year: "2021", role: "Ninja", package: "3.50 LPA", students_placed: 56, status: "Active", college: "USICT" },
            { company_name: "Cognizant", batch_year: "2021", role: "Direct Placement", package: "3.50 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Omnepresent", batch_year: "2021", role: "Direct Placement", package: "3.50 LPA", students_placed: 1, status: "Active", college: "USICT" }
        ];

        // USICT 2023 DATA
        const comp2023 = [
            { company_name: "Rapido", batch_year: "2023", role: "Corporate Selection", package: "23.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Achieve AI", batch_year: "2023", role: "Corporate Selection", package: "19.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "MathWorks India", batch_year: "2023", role: "Corporate Selection", package: "18.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Saxo Group", batch_year: "2023", role: "Corporate Selection", package: "17.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Josh Technology", batch_year: "2023", role: "Corporate Selection", package: "14.75 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Thorogood", batch_year: "2023", role: "Corporate Selection", package: "14.15 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Applicate AI", batch_year: "2023", role: "Corporate Selection", package: "14.10 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Zenon Analytics", batch_year: "2023", role: "Corporate Selection", package: "14.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Cvent", batch_year: "2023", role: "Corporate Selection", package: "13.70 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Gradeup", batch_year: "2023", role: "Corporate Selection", package: "12.00 LPA", students_placed: 5, status: "Active", college: "USICT" },
            { company_name: "Interra Systems India", batch_year: "2023", role: "Corporate Selection", package: "12.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Bluecore India", batch_year: "2023", role: "Corporate Selection", package: "12.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Super Six Gaming", batch_year: "2023", role: "Corporate Selection", package: "11.00 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "POSHN", batch_year: "2023", role: "Corporate Selection", package: "10.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Travclan", batch_year: "2023", role: "Corporate Selection", package: "10.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Indus Valley Partners", batch_year: "2023", role: "Corporate Selection", package: "9.00 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "Libsys Ltd", batch_year: "2023", role: "Corporate Selection", package: "9.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Roro Solutions LLP", batch_year: "2023", role: "Corporate Selection", package: "9.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Oracle", batch_year: "2023", role: "Corporate Selection", package: "8.80 LPA", students_placed: 5, status: "Active", college: "USICT" },
            { company_name: "Nokia", batch_year: "2023", role: "Corporate Selection", package: "8.70 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Yamaha Motors", batch_year: "2023", role: "Corporate Selection", package: "8.60 LPA", students_placed: 4, status: "Active", college: "USICT" }
        ];

        // USICT 2024 DATA
        const comp2024 = [
            { company_name: "Corning", batch_year: "2024", role: "Corporate Selection", package: "20.50 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Cvent", batch_year: "2024", role: "Corporate Selection", package: "15.30 LPA", students_placed: 5, status: "Active", college: "USICT" },
            { company_name: "Zenon", batch_year: "2024", role: "Corporate Selection", package: "14.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "CVent (SRE)", batch_year: "2024", role: "Corporate Selection", package: "13.60 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "AB InBev", batch_year: "2024", role: "Corporate Selection", package: "12.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "TCS (Prime)", batch_year: "2024", role: "Corporate Selection", package: "11.50 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Yamaha", batch_year: "2024", role: "Corporate Selection", package: "10.30 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Tejas Networks Ltd", batch_year: "2024", role: "Corporate Selection", package: "10.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Tredence Analytics", batch_year: "2024", role: "Corporate Selection", package: "10.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Roro.ai", batch_year: "2024", role: "Corporate Selection", package: "9.00 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "TCS (Prime Fallback)", batch_year: "2024", role: "Corporate Selection", package: "9.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "Unacademy", batch_year: "2024", role: "Corporate Selection", package: "8.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Cubastion Consulting", batch_year: "2024", role: "Corporate Selection", package: "7.70 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Hexaview", batch_year: "2024", role: "Corporate Selection", package: "7.50 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "TCS (Digital)", batch_year: "2024", role: "Digital", package: "7.00 LPA", students_placed: 13, status: "Active", college: "USICT" },
            { company_name: "Genpact", batch_year: "2024", role: "Technical Consultant", package: "6.30 LPA", students_placed: 17, status: "Active", college: "USICT" },
            { company_name: "BUSY Infotech", batch_year: "2024", role: "Software Engineer", package: "6.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "L&T LTD", batch_year: "2024", role: "Engineer", package: "6.00 LPA", students_placed: 1, status: "Active", college: "USICT" },
            { company_name: "SUCCESSIVE TECHNOLOGIES", batch_year: "2024", role: "Software Engineer", package: "6.00 LPA", students_placed: 8, status: "Active", college: "USICT" },
            { company_name: "Hexaview (AE)", batch_year: "2024", role: "AE", package: "6.00 LPA", students_placed: 2, status: "Active", college: "USICT" },
            { company_name: "Ganit", batch_year: "2024", role: "Data Analyst", package: "6.00 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "INDIA SHELTER", batch_year: "2024", role: "Data Analyst", package: "6.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "CTPL.ai", batch_year: "2024", role: "Assistant Professor助理", package: "5.40 LPA", students_placed: 6, status: "Active", college: "USICT" },
            { company_name: "Finvest Fx", batch_year: "2024", role: "SDE", package: "5.00 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Airtel", batch_year: "2024", role: "GET NOC Engineer", package: "4.50 LPA", students_placed: 5, status: "Active", college: "USICT" },
            { company_name: "IBM", batch_year: "2024", role: "Associate System Engineer", package: "4.50 LPA", students_placed: 4, status: "Active", college: "USICT" },
            { company_name: "Orange Business", batch_year: "2024", role: "GET", package: "4.40 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "Vivo", batch_year: "2024", role: "SMT", package: "3.60 LPA", students_placed: 3, status: "Active", college: "USICT" },
            { company_name: "TCS (Ninja)", batch_year: "2024", role: "Ninja", package: "3.30 LPA", students_placed: 15, status: "Active", college: "USICT" }
        ];

        const summaries = [
            {
                college: "USICT",
                batch_year: "2024",
                highest_package: 41.2,
                average_package: 7.2,
                total_offers: 126,
                total_companies: 32,
                is_official: true
            },
            {
                college: "USICT",
                batch_year: "2023",
                highest_package: 23,
                average_package: 8.45,
                total_offers: 190,
                placement_rate: 85.4,
                total_companies: 130,
                branch_rates: [
                    { name: "Computer Science and Engineering", rate: 100.00 },
                    { name: "Electronics and Communication Engineering", rate: 52.38 },
                    { name: "Information Technology", rate: 100.00 }
                ],
                branch_highest: [
                    { name: "Computer Science and Engineering", value: 23.00 },
                    { name: "Electronics and Communication Engineering", value: 11.00 },
                    { name: "Information Technology", value: 19.00 }
                ],
                branch_average: [
                    { name: "Computer Science and Engineering", value: 9.37 },
                    { name: "Electronics and Communication Engineering", value: 6.63 },
                    { name: "Information Technology", value: 8.42 }
                ],
                is_official: true
            },
            {
                college: "USICT",
                batch_year: "2022",
                highest_package: 51,
                average_package: 12.0,
                total_offers: 370,
                placement_rate: 62.5, // Total rate from image
                total_companies: 70,
                internship_offers: 120,
                branch_rates: [
                    { name: "Computer Science and Engineering", rate: 67.80 },
                    { name: "Electronics and Communication Engineering", rate: 43.59 },
                    { name: "Information Technology", rate: 70.37 }
                ],
                branch_highest: [
                    { name: "Computer Science and Engineering", value: 44.14 },
                    { name: "Electronics and Communication Engineering", value: 44.14 },
                    { name: "Information Technology", value: 45.00 }
                ],
                branch_average: [
                    { name: "Computer Science and Engineering", value: 11.64 },
                    { name: "Electronics and Communication Engineering", value: 11.36 },
                    { name: "Information Technology", value: 15.79 }
                ],
                is_official: true
            },
            {
                college: "USICT",
                batch_year: "2021",
                highest_package: 32,
                average_package: 8.5,
                total_offers: 250,
                placement_rate: 94,
                total_companies: 40,
                internship_offers: 120,
                is_official: true
            }
        ];

        await Company.deleteMany({ college: "USICT", batch_year: { $in: ["2021", "2022", "2023", "2024"] } });
        await Company.insertMany([...comp2024, ...comp2023, ...comp2022, ...comp2021]);
        console.log(`Successfully seeded ${comp2024.length + comp2023.length + comp2022.length + comp2021.length} USICT records.`);

        await BatchSummary.deleteMany({ college: "USICT", batch_year: { $in: ["2021", "2022", "2023", "2024"] } });
        await BatchSummary.insertMany(summaries);
        console.log(`Successfully seeded institutional summaries.`);

        console.log("USICT 2024, 2023, 2022 and 2021 High-Fidelity Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seedUSICT();
