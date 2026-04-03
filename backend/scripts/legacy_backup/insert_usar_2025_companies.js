const mongoose = require('mongoose');
require('dotenv').config();

async function insertCompanies() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Atlas");

    const Company = require('./models/Company');

    // Clear existing USAR 2025 company records first to avoid duplicates
    await Company.deleteMany({ college: 'USAR', batch_year: '2025' });
    console.log("🗑️  Cleared existing USAR 2025 company records");

    const companies = [
        { sr: 1, company_name: "GoDaddy Inc.", package: "27 LPA", role: "SDE Intern", students_placed: 1, company_type: "Technology" },
        { sr: 2, company_name: "RT Camp Solutions Pvt. Ltd.", package: "12 LPA", role: "Software Engineer", students_placed: 3, company_type: "Technology" },
        { sr: 3, company_name: "McKinley & Rice Pvt. Ltd.", package: "10 LPA", role: "Business Development Executive", students_placed: 1, company_type: "Consulting" },
        { sr: 4, company_name: "Infosys Ltd.", package: "9.5 LPA", role: "Specialist Programmer", students_placed: 5, company_type: "Technology" },
        { sr: 5, company_name: "TVS Motor Company", package: "8 LPA", role: "Quality Engineer (Mechatronics)", students_placed: 2, company_type: "Manufacturing" },
        { sr: 6, company_name: "RSM USI", package: "7.7 LPA", role: "Technical Risk Consultant / Associate Consultant", students_placed: 5, company_type: "Consulting" },
        { sr: 7, company_name: "Terafac Technologies Pvt. Ltd.", package: "7 LPA", role: "Jr. AIML & Vision Engineer", students_placed: 2, company_type: "Technology" },
        { sr: 8, company_name: "Internzvalley Pvt. Ltd.", package: "7 LPA", role: "Business Development Executive", students_placed: 11, company_type: "Consulting" },
        { sr: 9, company_name: "Cloud Techner Services Pvt. Ltd.", package: "7 LPA", role: "DevOps Intern", students_placed: 2, company_type: "Technology" },
        { sr: 10, company_name: "Cognizant Corporation", package: "6.75 LPA", role: "Genc Next Select", students_placed: 3, company_type: "Technology" },
        { sr: 11, company_name: "Amar Ujala Ltd.", package: "6.5 LPA", role: "Data Scientist", students_placed: 1, company_type: "Media" },
        { sr: 12, company_name: "Infogain Corporation India Ltd.", package: "6.35 LPA", role: "Associate Software Engineer / Data Science Engineer", students_placed: 7, company_type: "Technology" },
        { sr: 13, company_name: "Genpact Ltd.", package: "6.35 LPA", role: "DevOps Cloud Consultant / Technical Consultant", students_placed: 5, company_type: "Consulting" },
        { sr: 14, company_name: "McKinley & Rice Pvt. Ltd.", package: "6 LPA", role: "Sales Intern / Accounts Manager", students_placed: 2, company_type: "Consulting" },
        { sr: 15, company_name: "TensorGo Software Technologies", package: "6 LPA", role: "Computer Vision Engineer", students_placed: 2, company_type: "Technology" },
        { sr: 16, company_name: "AVL", package: "6 LPA", role: "Software Developer", students_placed: 1, company_type: "Technology" },
        { sr: 17, company_name: "RTDS Pvt. Ltd.", package: "6 LPA", role: "Cloud Solutions Consultant", students_placed: 1, company_type: "Technology" },
        { sr: 18, company_name: "Terafac Technologies Pvt. Ltd.", package: "6 LPA", role: "Jr. Robotics Engineer", students_placed: 2, company_type: "Technology" },
        { sr: 19, company_name: "Earth Crust - (Lets Try) Pvt. Ltd.", package: "6 LPA", role: "Data Analyst Intern", students_placed: 4, company_type: "Technology" },
        { sr: 20, company_name: "Earth Crust - (Lets Try) Pvt. Ltd.", package: "6 LPA", role: "UI-UX Intern", students_placed: 1, company_type: "Technology" },
        { sr: 21, company_name: "Capgemini Technology Services India Ltd.", package: "5.75 LPA", role: "Analyst-2", students_placed: 2, company_type: "Technology" },
        { sr: 22, company_name: "Publicis Sapient", package: "5.1 LPA", role: "Quality Engineer", students_placed: 1, company_type: "Technology" },
        { sr: 23, company_name: "Unthinkable Solutions", package: "5 LPA", role: "Software Developer", students_placed: 1, company_type: "Technology" },
        { sr: 24, company_name: "High-Technext Engineering & Telecom Pvt. Ltd.", package: "4.5 LPA", role: "Technical Site Engineer", students_placed: 6, company_type: "Engineering" },
        { sr: 25, company_name: "Capgemini Technology Services India Ltd.", package: "4.25 LPA", role: "Analyst", students_placed: 26, company_type: "Technology" },
        { sr: 26, company_name: "Cognizant Corporation", package: "4 LPA", role: "Genc Select", students_placed: 1, company_type: "Technology" },
        { sr: 27, company_name: "Infosys Ltd.", package: "3.6 LPA", role: "Systems Engineer", students_placed: 9, company_type: "Technology" },
        { sr: 28, company_name: "IndiaMart", package: "3.5 LPA", role: "Field Sales Exec. Intern", students_placed: 1, company_type: "E-Commerce" },
        { sr: 29, company_name: "Physics Wallah", package: "- LPA", role: "Android Developer Intern", students_placed: 1, company_type: "EdTech" },
        { sr: 30, company_name: "Microsoft", package: "- LPA", role: "Software Engineer", students_placed: 1, company_type: "Technology" },
    ];

    const docs = companies.map(c => ({
        college: 'USAR',
        batch_year: '2025',
        company_name: c.company_name,
        package: c.package,
        role: c.role,
        students_placed: c.students_placed,
        company_type: c.company_type,
        status: 'Completed',
        location: 'India'
    }));

    await Company.insertMany(docs);
    const total = companies.reduce((s, c) => s + c.students_placed, 0);
    console.log(`✅ Inserted ${docs.length} company records for USAR 2025`);
    console.log(`📊 Total students placed from records: ${total}`);

    process.exit(0);
}

insertCompanies().catch(e => { console.error(e); process.exit(1); });
