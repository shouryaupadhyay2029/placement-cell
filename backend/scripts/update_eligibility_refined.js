const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Verified Data for USAR 2025 Eligibility
const verifiedEligibility = [
    {
        "id": "elig-1",
        "company": "Microsoft",
        "cgpa": 7,
        "academics": "B.E./B.Tech/M.Tech/MCA in CS/IT or related fields with consistent academic record",
        "backlogs": "No active backlogs",
        "selectionProcess": [
            "Online Coding Test (5-6 questions on DSA)",
            "Group Fly (coding + explanation)",
            "Technical Interview 1 (DSA + core CS)",
            "Technical Interview 2 (OS, DBMS, CN, OOP)",
            "Technical Interview 3 (System Design)",
            "HR Round"
        ],
        "roles": ["Software Engineer", "Cloud Engineer", "AI Engineer", "Internships (SDE)"],
        "skills": {
            "core": ["DSA", "DBMS", "Operating Systems", "Computer Networks", "OOP", "System Design"],
            "programming": ["C#", "Java", "Python", "C++"],
            "tools": ["Azure", ".NET", "SQL"]
        },
        "notes": "Strong problem-solving and system design required",
        "type": "Product Based",
        "difficulty": "Hard"
    },
    {
        "id": "elig-2",
        "company": "IndiaMART",
        "cgpa": 5.5,
        "academics": "50-60% in graduation, 60-70% in 10th and 12th",
        "backlogs": "Not specified",
        "selectionProcess": [
            "Pre-Placement Talk",
            "Aptitude Test",
            "Group Discussion",
            "Personal Interview"
        ],
        "roles": ["Client Acquisition Executive", "Inside Sales Executive", "Tele Associate"],
        "skills": {
            "core": [],
            "programming": [],
            "tools": []
        },
        "notes": "Strong English and Hindi communication required",
        "type": "Sales",
        "difficulty": "Easy"
    },
    {
        "id": "elig-3",
        "company": "Unthinkable Solutions",
        "cgpa": 6,
        "academics": "B.Tech/BE (CS/IT/ECE) or MCA with 60%+",
        "backlogs": "No active backlogs",
        "selectionProcess": [
            "Online Coding Assessment (3 questions)",
            "Technical Interview (DSA + projects)",
            "Technical Interview (core subjects)",
            "HR Interview"
        ],
        "roles": ["Software Developer"],
        "skills": {
            "core": ["DSA", "OOP", "DBMS", "Operating Systems"],
            "programming": [],
            "tools": []
        },
        "notes": "Focus on coding and project understanding",
        "type": "Service/Product",
        "difficulty": "Medium"
    },
    {
        "id": "elig-4",
        "company": "Publicis Sapient",
        "cgpa": 6.5,
        "academics": "B.Tech in CS/IT/ECE/Maths/Software fields with 65%+",
        "backlogs": "No active backlogs",
        "selectionProcess": [
            "Online Assessment (aptitude + DSA)",
            "Technical Interview 1",
            "Technical Interview 2 (projects + CS concepts)",
            "HR Round"
        ],
        "roles": ["Software Engineer", "Full Stack Developer", "Data Engineer"],
        "skills": {
            "core": ["DSA", "DBMS", "Operating Systems", "Computer Networks", "OOP"],
            "programming": ["Java", "Python", "C++"],
            "tools": ["React", "Spring", "SQL"]
        },
        "notes": "Strong CS fundamentals and problem-solving required",
        "type": "Product Based",
        "difficulty": "Hard"
    },
    {
        "id": "elig-5",
        "company": "RTDS Pvt Ltd",
        "cgpa": 6,
        "academics": "75% in 10th/12th and 60% in B.Tech",
        "backlogs": "Not specified",
        "selectionProcess": [
            "Resume Screening",
            "Technical MCQ Test",
            "Group Discussion / Managerial Round",
            "Final Interview"
        ],
        "roles": ["Software/IT Engineer"],
        "skills": {
            "core": ["DSA", "OOP"],
            "programming": ["Java", "React Native"],
            "tools": ["Cloud Computing"]
        },
        "notes": "Focus on technical basics and communication",
        "type": "Service",
        "difficulty": "Medium"
    },
    {
        "id": "elig-6",
        "company": "AVL",
        "cgpa": 6,
        "academics": "60% throughout academics",
        "backlogs": "No backlogs",
        "selectionProcess": [
            "Domain Knowledge Test",
            "Aptitude Test",
            "Personal Interview"
        ],
        "roles": [],
        "skills": {
            "core": [],
            "programming": [],
            "tools": []
        },
        "notes": "Max 1-year academic gap allowed",
        "type": "Core",
        "difficulty": "Medium"
    },
    {
        "id": "elig-7",
        "company": "TensorGo Software",
        "cgpa": 8,
        "academics": "70% in X/XII with high CGPA in B.Tech/M.Tech/MCA",
        "backlogs": "No active backlogs",
        "selectionProcess": [
            "Resume Shortlisting",
            "Technical Assignment",
            "AI/Bot Interview",
            "Technical Interviews",
            "HR Round"
        ],
        "roles": ["ML Engineer", "Computer Vision Engineer", "Full Stack Developer"],
        "skills": {
            "core": ["Deep Learning", "Computer Vision"],
            "programming": ["Python", "C++", "JavaScript"],
            "tools": ["TensorFlow", "PyTorch", "OpenCV", "React", "Node.js"]
        },
        "notes": "Project-based hiring, strong ML knowledge required",
        "type": "Product/AI",
        "difficulty": "Hard"
    },
    {
        "id": "elig-8",
        "company": "Genpact",
        "cgpa": 6,
        "academics": "60% or 6 CGPA throughout",
        "backlogs": "No active backlogs",
        "selectionProcess": [
            "Online Assessment (aptitude + coding)",
            "Technical Interview",
            "HR Interview"
        ],
        "roles": ["Software Engineer", "Data Engineer", "DevOps Engineer"],
        "skills": {
            "core": ["DSA", "DBMS", "Operating Systems", "Computer Networks", "OOP"],
            "programming": ["Java", "Python"],
            "tools": ["Cloud"]
        },
        "notes": "Strong analytical and coding skills required",
        "type": "Service",
        "difficulty": "Medium"
    },
    {
        "id": "elig-9",
        "company": "Infogain",
        "cgpa": 6,
        "academics": "60% throughout",
        "backlogs": "No active backlogs",
        "selectionProcess": [
            "Written Test (aptitude + technical + English)",
            "Technical Interview",
            "HR Interview"
        ],
        "roles": ["Software Engineer"],
        "skills": {
            "core": ["SQL", "DBMS"],
            "programming": ["Java", "C++"],
            "tools": []
        },
        "notes": "Focus on aptitude and technical basics",
        "type": "Service",
        "difficulty": "Medium"
    },
    {
        "id": "elig-10",
        "company": "Amar Ujala",
        "cgpa": 0,
        "academics": "Graduate in Journalism or related fields",
        "backlogs": "Not specified",
        "selectionProcess": [
            "Written Test",
            "Interview"
        ],
        "roles": ["Journalist", "Content Writer", "Editor"],
        "skills": {
            "core": ["Writing", "Communication"],
            "programming": [],
            "tools": []
        },
        "notes": "Hindi proficiency required",
        "type": "Media",
        "difficulty": "Easy"
    }
];

// Update USAR 2025 Eligibility
data.USAR["2025"].eligibility = verifiedEligibility;

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ data.json eligibility updated with refined structure.');
