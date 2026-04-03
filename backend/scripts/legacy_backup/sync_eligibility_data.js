const mongoose = require("mongoose");
const Company = require("../models/Company");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

console.log("Using MONGO_URI:", process.env.MONGO_URI ? "FOUND" : "NOT FOUND");

// --- MASTER DATA LIST ---
// Add all company criteria here to keep everything in ONE file.
const eligibilityMasterData = [
    {
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
        description: "Focus on Core Subjects: DSA, OS, CN, DBMS. Tools: Git, Unit Testing. Cloud: AWS/Azure.",
        required_skills: ["DSA", "OS", "Networking", "DBMS", "Software Engineering", "Java", "Python", "C++", "APIs", "Spring", "AWS/Azure", "Git", "Unit Testing"],
        company_type: "Service-based",
        college: "USAR"
    },
    {
        company_name: "rtCamp",
        batch_year: "2025",
        role: "WordPress Developer",
        package: "Standard Product Package",
        location: "Remote / Hybrid",
        min_cgpa: 0,
        allowed_branches: "CS, IT, All (Skill-based)",
        backlog_criteria: "No active backlogs preferred",
        selection_process: "GitHub Portfolio Review > Technical Interview > HR Discussion",
        eligibility: "Based on GitHub Profile & Projects",
        description: "Focusing on PHP, JavaScript, and WordPress knowledge.",
        required_skills: ["PHP", "JavaScript", "WordPress", "GitHub Portfolio"],
        company_type: "Product-based",
        college: "USAR"
    },
    {
        company_name: "GoDaddy",
        batch_year: "2025",
        role: "Software Development Engineer",
        package: "8 - 14 LPA",
        location: "Gurugram / Remote",
        min_cgpa: 0,
        allowed_branches: "B.E./B.Tech in CS or related fields",
        backlog_criteria: "No active backlogs allowed",
        selection_process: "HackerRank OA > 2-3 Technical Interviews > Behavioral/Fit Round",
        eligibility: "B.E. / B.Tech CS/IT",
        description: "Strong DSA skills, proficient SQL knowledge. Experience with cloud computing (AWS), microservices, and AI/ML tools is a plus.",
        required_skills: ["DSA", "SQL", "Java", "Python", "GoLang", "AWS", "Microservices", "AI/ML"],
        company_type: "Product-based",
        college: "USAR"
    },
    {
        company_name: "McKinley & Rice",
        batch_year: "2025",
        role: "Full Stack Developer",
        package: "LPA",
        location: "Noida / Global",
        min_cgpa: 7.0,
        allowed_branches: "B.Tech (CSE/IT/AI), MCA, M.Tech, MBA",
        backlog_criteria: "None specified",
        selection_process: "Preliminary (Aptitude/IQ) > Domain Test (MERN/DS) > Tech Interview > HR",
        eligibility: "70% or 75% throughout (10th, 12th, Graduation)",
        description: "Strong verbal/written communication, time management, and specific technical skills (e.g., MERN stack, SQL).",
        required_skills: ["MERN Stack", "SQL", "Communication", "Time Management"],
        company_type: "Global Multi-disciplinary",
        college: "USAR"
    },
    {
        company_name: "Infosys Ltd.",
        batch_year: "2025",
        role: "Systems Engineer",
        package: "3.6 - 9.5 LPA",
        location: "Multiple Locations",
        min_cgpa: 6.8,
        allowed_branches: "B.E / B.Tech / M.Tech / MCA (Any Branch)",
        backlog_criteria: "No active backlogs",
        selection_process: "Online OA > Technical Interview > HR Discussion",
        eligibility: "Minimum 60% throughout academics (10th, 12th, UG/PG)",
        description: "Expect questions on DSA, DBMS, OS, Networking, OOP, and one programming language.",
        required_skills: ["DSA", "DBMS", "OS", "Networking", "OOP", "Programming (Java/Python/C++)"],
        company_type: "Service-based IT",
        college: "USAR"
    },
    {
        company_name: "TVS Motor Company",
        batch_year: "2025",
        role: "Graduate Engineer Trainee (GET)",
        package: "7 - 9.5 LPA",
        location: "Hosur / Bangalore / Chennai",
        min_cgpa: 6.0,
        allowed_branches: "Mechanical, Electrical, Electronics, CS, IT",
        backlog_criteria: "No history of arrears / backlogs throughout education",
        selection_process: "Profile Screening > Online Technical Test > Leadership Assessment > Group Discussion > PI",
        eligibility: "60% Marks Throughout education",
        description: "Strong technical knowledge of core subjects, proficiency in MS Excel, and good communication skills.",
        required_skills: ["Core Engineering Domain", "MS Excel", "Communication", "Leadership Competence"],
        company_type: "Core Automotive",
        college: "USAR"
    },
    {
        company_name: "RSM USI",
        batch_year: "2025",
        role: "Advisory / Audit / Tax Associate",
        package: "Competitive Package",
        location: "Gurugram / Bangalore / Hyderabad",
        min_cgpa: 0,
        allowed_branches: "MBA (Finance), MCA, M.Com, CA, CPA",
        backlog_criteria: "No active backlogs allowed",
        selection_process: "Numerical & Situational Tests > Technical (US GAAP) Interview > HR Round",
        eligibility: "CA, CPA, MBA (Finance), or Master's in Commerce",
        description: "Strong understanding of US GAAP accounting standards, financial statement analysis, advanced Excel, and PowerPoint. Focus on critical thinking.",
        required_skills: ["US GAAP", "Financial Analysis", "Excel", "PowerPoint", "Critical Thinking"],
        company_type: "Tax & Advisory",
        college: "USAR"
    },
    {
        company_name: "Terafac Technologies",
        batch_year: "2025",
        role: "Embedded Systems / ML Engineer",
        package: "Standard Product Package",
        location: "Noida / Bangalore",
        min_cgpa: 0,
        allowed_branches: "B.E / B.Tech / BCA / MCA / BSc / MSc (CS/IT/Electronics)",
        backlog_criteria: "None specified",
        selection_process: "Technical DS/Algo Assessment > Embedded Systems & ML Interview",
        eligibility: "Degree in CS/IT or Electronics",
        description: "AI/ML, robotics, computer vision, or embedded systems (Arduino, IoT) is highly preferred.",
        required_skills: ["Python", "C", "DSA", "AI/ML", "Robotics", "Computer Vision", "Embedded Systems", "Arduino", "IoT"],
        company_type: "Robotics & IoT",
        college: "USAR"
    },
    {
        company_name: "Internzvalley",
        batch_year: "2025",
        role: "Technical Intern / Trainee",
        package: "Stipend Based",
        location: "Remote / Hybrid",
        min_cgpa: 1, // Setting small non-zero to show it's data-driven if needed, or 0.
        min_cgpa: 0,
        allowed_branches: "All Engineering Branches",
        backlog_criteria: "None specified",
        selection_process: "Profile Shortlisting > Evaluation Task > Interview",
        eligibility: "Student from 2nd/3rd/Final year",
        description: "Training and placement platform. Experience with skill-based projects and communication skills.",
        required_skills: ["Skill-based Projects", "Communication", "Technical Fundamentals"],
        company_type: "EdTech / Consulting",
        college: "USAR"
    },
    {
        company_name: "Cloud Techner",
        batch_year: "2025",
        role: "Cloud / DevOps Engineer",
        package: "Competitive Package",
        location: "Pan India / Remote",
        min_cgpa: 0,
        allowed_branches: "B.E / B.Tech (CS, IT, or related)",
        backlog_criteria: "None specified",
        selection_process: "Technical Cloud/DevOps Assessment > Technical Interview",
        eligibility: "B.E/B.Tech in CS, IT, or related fields",
        description: "Strong understanding of cloud concepts (AWS/Azure), Linux OS, Networking, and scripting languages (Python/PowerShell) is required.",
        required_skills: ["AWS/Azure", "Linux OS", "Networking", "Python/PowerShell", "Docker", "Kubernetes", "Jenkins", "Git", "Ansible"],
        company_type: "Cloud & Managed Services",
        college: "USAR"
    },
    {
        company_name: "Cognizant",
        batch_year: "2025",
        role: "Software Engineer (GenC)",
        package: "4.0 - 8.5 LPA",
        location: "Pan India",
        min_cgpa: 6.0,
        allowed_branches: "B.E / B.Tech / M.E / M.Tech / MCA / MSc",
        backlog_criteria: "No standing backlogs at the time of selection",
        selection_process: "Aptitude & Technical Assessment > Technical Interview > HR Discussion",
        eligibility: "60% or above throughout (10th, 12th, UG, PG). Max 2-year academic gap.",
        description: "Digital services, IT operations, Java, cloud, SQL, DBMS, OS, Networking, OOP, SDLC, agile practices.",
        required_skills: ["DSA", "SQL", "DBMS", "OS", "Networking", "OOP", "SDLC", "Agile", "C/Java/Python", "Spring", "Cloud Basics", "Git", "Unit Testing"],
        company_type: "Service-based MNC",
        college: "USAR"
    },
    {
        company_name: "Amar Ujala",
        batch_year: "2025",
        role: "Tech Operations Trainee",
        package: "Standard Package",
        location: "Noida / New Delhi",
        min_cgpa: 0,
        allowed_branches: "All Engineering Branches",
        backlog_criteria: "None specified",
        selection_process: "Profile Review > Interview Rounds",
        eligibility: "Bachelors in any technical stream",
        description: "Focus on Media Tech, Digital Services, and IT operations in the publishing domain.",
        required_skills: ["Digital Services", "IT Operations", "Media Tech"],
        company_type: "Media & Publishing",
        college: "USAR"
    },
    {
        company_name: "Infogain",
        batch_year: "2025",
        role: "Associate Software Engineer",
        package: "Standard Package",
        location: "Noida / Mumbai / Pune",
        min_cgpa: 6.0,
        allowed_branches: "CS, IT, Electronics",
        backlog_criteria: "No backlogs at the time of applying",
        selection_process: "Written Exam > Technical Interview > HR Interview",
        eligibility: "60% throughout (Class X, XII and Graduation)",
        description: "Associate Software Engineer roles. Familiarity with C, C++, Java, Python, and SQL.",
        required_skills: ["C", "C++", "Java", "Python", "SQL", "Technical Logic"],
        company_type: "Digital Platform Engineering",
        college: "USAR"
    },
    {
        company_name: "Genpact",
        batch_year: "2025",
        role: "Software Engineer",
        package: "4.5 - 6.5 LPA",
        location: "Gurugram / Noida / Bangalore",
        min_cgpa: 6.0,
        allowed_branches: "CSE, ECE, IT, EEE, TELECOM, EI",
        backlog_criteria: "No active backlogs",
        selection_process: "Online Round (Aptitude/DSA) > Virtual Technical Interview > HR Round",
        eligibility: "60% or 6.0 CGPA throughout (10th, 12th, UG)",
        description: "Focus on DSA (Arrays, Trees, Graphs), DBMS, OS, Networking, and OOP. Digital operations and AI domain Knowledge.",
        required_skills: ["DSA", "DBMS", "OS", "Networking", "OOP", "SDLC", "Agile", "Digital Operations", "AI for Business"],
        company_type: "Professional Services / MNC",
        college: "USAR"
    },
    {
        company_name: "TensorGo",
        batch_year: "2025",
        role: "Computer Vision / Full Stack Engineer",
        package: "Competitive",
        location: "Hyderabad / Remote",
        min_cgpa: 8.0,
        allowed_branches: "CS, AI, Data Science (B.Tech/M.Tech/MCA)",
        backlog_criteria: "None specified",
        selection_process: "Technical Assessment > Computer Vision/Full-Stack Interview Rounds",
        eligibility: "Min 70% in 10th/12th, 8.0 CGPA in Degree",
        description: "Python, C++, OpenCV, TensorFlow, PyTorch, React, Node, MySQL, Cloud (AWS/OCI), Microservices.",
        required_skills: ["Python", "C++", "OpenCV", "DSA", "TensorFlow", "PyTorch", "React.js", "Node.js", "MySQL", "Microservices", "AWS/OCI"],
        company_type: "AI & CV Specialist",
        college: "USAR"
    },
    {
        company_name: "AVL",
        batch_year: "2025",
        role: "Graduate Engineering Trainee",
        package: "Standard Package",
        location: "Gurugram / Pune",
        min_cgpa: 6.0,
        allowed_branches: "Mechanical and Electronics engineering",
        backlog_criteria: "Zero active or cleared backlogs permitted",
        selection_process: "Domain Knowledge Test > Aptitude Test > Personal Interview",
        eligibility: "Consistently >60% in 10th, 12th, and B.Tech",
        description: "Automotive engineering and development services. Simulation and testing focus.",
        required_skills: ["Mechanical Engineering", "Electronics Engineering", "Aptitude", "Domain Core Knowledge"],
        company_type: "Automotive / Simulation",
        college: "USAR"
    },
    {
        company_name: "RTDS",
        batch_year: "2025",
        role: "Associate Cloud Telephony / Server Engineer",
        package: "Standard Package",
        location: "Gurugram / Noida",
        min_cgpa: 7.5,
        allowed_branches: "B.Tech (CS/IT/EC/ET/EE), B.Com",
        backlog_criteria: "None specified",
        selection_process: "Online Technical Test (MCQs) > Group Discussion > Tech Interview > HR",
        eligibility: "75% in X, XII and Graduation (Strict Requirement)",
        description: "Networking knowledge and ability to work in high-stress environments. Strong English verbal communication.",
        required_skills: ["Networking", "Global Communication (English)", "DBMS", "OS", "OOPs", "Data Structures"],
        company_type: "Cloud Telephony & Services",
        college: "USAR"
    },
    {
        company_name: "Publicis Sapient",
        batch_year: "2025",
        role: "Software Engineer / Data Engineer",
        package: "8.5 - 15.0 LPA",
        location: "Gurugram / Bangalore / Pune",
        min_cgpa: 6.5,
        allowed_branches: "CS, IT, Software Eng, Math & Computing, ECE",
        backlog_criteria: "No active backlogs",
        selection_process: "Online Coding Assessment > 2-3 Technical Interviews (DSA/System Design) > HR Evaluation",
        eligibility: "6.5 CGPA or 65% throughout academics",
        description: "Problem-solving, Linked lists, Trees, Subarrays. Databases, OS, Networking, OOP, Agile, Digital Consulting.",
        required_skills: ["DSA (Trees/Lists/Subarrays)", "SQL", "DBMS", "OS", "Networking", "OOP", "Agile", "Digital Transformation", "UX Design"],
        company_type: "Digital Transformation Consulting",
        college: "USAR"
    },
    {
        company_name: "Unthinkable Solutions",
        batch_year: "2025",
        role: "Full-Stack Developer",
        package: "Competitive",
        location: "Gurugram",
        min_cgpa: 6.5,
        allowed_branches: "B.Tech, MCA, BCA, M.Tech (CS, IT, ECE)",
        backlog_criteria: "No pending/active backlogs",
        selection_process: "Online Coding Assessment (3 Qs) > Technical Rounds (2-3) > HR Interview",
        eligibility: "60% or above in 10th, 12th, and Graduation",
        description: "Project-focused assessments. Strong understanding of DSA, OOPS, Databases, and SQL.",
        required_skills: ["DSA", "OOPS", "Databases", "SQL", "Logic Development"],
        company_type: "Product Engineering",
        college: "USAR"
    },
    {
        company_name: "IndiaMart",
        batch_year: "2025",
        role: "Executive - Client Acquisition / Servicing",
        package: "4.5 - 7.5 LPA",
        location: "Noida / Pan India",
        min_cgpa: 5.0,
        allowed_branches: "Any Degree / MBA / Engineering",
        backlog_criteria: "None specified",
        selection_process: "Sales Aptitude Assessment > Group Discussion > Personal Interview Rounds",
        eligibility: "65% in X/XII, 50% or above in Graduation/MBA",
        description: "Excellent verbal communication, active listening, quick thinking, and a target-oriented attitude.",
        required_skills: ["Verbal Communication", "Active Listening", "Quick Thinking", "Target-Oriented Attitude"],
        company_type: "B2B Marketplace",
        college: "USAR"
    },
    {
        company_name: "Microsoft",
        batch_year: "2025",
        role: "Software Development Engineer (SDE-1)",
        package: "44 - 51 LPA",
        location: "Hyderabad / Bangalore / Noida",
        min_cgpa: 8.0,
        allowed_branches: "B.E / B.Tech / M.Tech / MCA (CS/IT or related)",
        backlog_criteria: "No active backlogs permitted",
        selection_process: "Online Round > 4-6 Stages (Onsite Rounds / Technical DSA-1 / Technical DSA-2 / System Design / HR)",
        eligibility: "Consistent academics (typically 7.0-8.0+ CGPA)",
        description: "Exceptional DSA and system design skills. Roles in Azure, Office, Copilot and AI. Proficiency in C#, Java, Python, and C++.",
        required_skills: ["DSA (Exceptional)", "System Design", "C#", "Java", "Python", "C++", "Azure/Cloud", "Leadership Principles"],
        company_type: "Big Tech Product",
        college: "USAR"
    }
];

async function syncEligibilityData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        for (const data of eligibilityMasterData) {
            await Company.findOneAndUpdate(
                { company_name: data.company_name, batch_year: data.batch_year, college: data.college },
                { ...data, status: "Active" }, // Mark as active so it shows up
                { upsert: true, new: true }
            );
            console.log(`Synced: ${data.company_name}`);
        }

        console.log("\n🔥 ALL DATA SYNCHRONIZED SUCCESSFULLY.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Sync Error:", error);
        process.exit(1);
    }
}

syncEligibilityData();
