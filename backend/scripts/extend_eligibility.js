const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const newCompanies = [
    {
        "id": "elig-11",
        "company": "rtCamp Solutions",
        "cgpa": 6,
        "academics": "Minimum 60% or 6.0 CGPA throughout 10th, 12th, and Graduation",
        "backlogs": "Not explicitly mentioned",
        "selectionProcess": [
            "Resume & GitHub Shortlisting",
            "Technical Assignment",
            "Technical Interview (Zoom)",
            "HR Round"
        ],
        "roles": [
            "Web Developer",
            "WordPress Developer"
        ],
        "skills": {
            "core": [
                "Web Development",
                "System Design Basics"
            ],
            "programming": [
                "PHP",
                "JavaScript"
            ],
            "tools": [
                "WordPress",
                "Git",
                "SQL"
            ]
        },
        "notes": "GitHub projects and contributions are prioritized over resumes",
        "type": "Product/Service",
        "difficulty": "Medium"
    },
    {
        "id": "elig-12",
        "company": "GoDaddy",
        "cgpa": 6.75,
        "academics": "B.Tech/B.E. in CS/IT or related fields with 60%+ throughout",
        "backlogs": "No active backlogs",
        "selectionProcess": [
            "Online Assessment (HackerRank)",
            "Technical Interview 1 (DSA + projects)",
            "Technical Interview 2 (System Design)",
            "Behavioral / HR Interview"
        ],
        "roles": [
            "Software Engineer"
        ],
        "skills": {
            "core": [
                "DSA",
                "DBMS",
                "Operating Systems",
                "Computer Networks"
            ],
            "programming": [
                "Java",
                "C#",
                "Python",
                "Golang"
            ],
            "tools": [
                "AWS",
                "Microservices"
            ]
        },
        "notes": "Medium to hard DSA questions; strong project understanding required",
        "type": "Product Based",
        "difficulty": "Hard"
    }
];

if (!data.USAR["2025"].eligibility) {
    data.USAR["2025"].eligibility = [];
}

newCompanies.forEach(newComp => {
    const existingIndex = data.USAR["2025"].eligibility.findIndex(c => (c.company || c.company_name) === newComp.company);
    
    if (existingIndex !== -1) {
        // Update existing while preserving ID if it already has one
        const oldId = data.USAR["2025"].eligibility[existingIndex].id;
        data.USAR["2025"].eligibility[existingIndex] = { ...newComp, id: oldId || newComp.id };
        console.log(`✅ Updated existing company: ${newComp.company}`);
    } else {
        // Push new
        data.USAR["2025"].eligibility.push(newComp);
        console.log(`✅ Added new company: ${newComp.company}`);
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`🚀 Eligibility sync complete. Total USAR 2025 companies: ${data.USAR["2025"].eligibility.length}`);
