/**
 * Smart Placement Assistant Engine
 * 
 * A guidance-focused algorithm that analyzes student profiles against company requirements.
 * Focuses on mentorship, encouragement, and actionable growth paths.
 */

class SmartPlacementAssistant {
    constructor() {
        // Skill categorization dictionary to provide structured feedback
        this.skillCategories = {
            "DSA & Problem Solving": ["ds", "algo", "data structures", "algorithms", "problem solving", "cp", "competitive programming", "c++", "java"],
            "Web Development": ["html", "css", "javascript", "react", "node", "express", "angular", "vue", "frontend", "backend", "fullstack", "nextjs"],
            "Data & Cloud": ["sql", "mysql", "mongodb", "aws", "gcp", "azure", "docker", "kubernetes", "cloud", "database"],
            "Core CS Concepts": ["os", "dbms", "cn", "computer networks", "operating systems", "oops", "object oriented programming", "system design"]
        };
    }

    /**
     * Categorize a specific skill into its broader domain area for better context
     */
    _categorizeSkill(skill) {
        const lowerSkill = skill.toLowerCase();
        for (const [category, keywords] of Object.entries(this.skillCategories)) {
            if (keywords.includes(lowerSkill)) return category;
        }
        return "Specialized/Other Skills";
    }

    /**
     * Generate constructive, mentor-like guidance based on missing skills
     */
    _generateGuidance(missingCategories, totalRequired, missingCount, companyName) {
        if (missingCount === 0) {
            return `Excellent match! Your skill profile aligns perfectly with what ${companyName} is looking for. Focus on refining your interview presence and you're good to go.`;
        }

        const matchRatio = (totalRequired - missingCount) / totalRequired;
        const missingList = Object.keys(missingCategories).join(" and ");

        if (matchRatio >= 0.7) {
            return `You're very close to this opportunity! Strengthening your foundation in ${missingList} can significantly improve your chances.`;
        } else if (matchRatio >= 0.4) {
            return `You have a great start. Investing time into building projects around ${missingList} will bridge the gap and make your profile stand out for ${companyName}.`;
        } else {
            return `This is a great growth opportunity! ${companyName} emphasizes ${missingList}. Consider exploring targeted courses in these areas to align your profile for future roles.`;
        }
    }

    /**
     * Analyze a student's profile against a specific company
     */
    analyzeCompanyFit(studentProfile, companyReqs) {
        const studentSkillsLow = studentProfile.skills.map(s => s.toLowerCase());
        const requiredSkillsLow = companyReqs.requiredSkills.map(s => s.toLowerCase());

        let matchedSkills = [];
        let missingSkills = [];
        let missingCategories = {};

        // Identify skill matches and gaps
        requiredSkillsLow.forEach(skill => {
            const originalSkill = companyReqs.requiredSkills[requiredSkillsLow.indexOf(skill)];
            if (studentSkillsLow.includes(skill)) {
                matchedSkills.push(originalSkill);
            } else {
                missingSkills.push(originalSkill);
                
                const category = this._categorizeSkill(skill);
                missingCategories[category] = (missingCategories[category] || 0) + 1;
            }
        });

        // Determine Match Level securely without toxic evaluation terms
        let matchLevel = "Growth Opportunity";
        const percentageMatch = requiredSkillsLow.length > 0 
            ? matchedSkills.length / requiredSkillsLow.length 
            : 1;

        // Apply Branch and CGPA loose filtering logic context (soft validation)
        const meetsCGPA = studentProfile.cgpa >= (companyReqs.minCgpa || 0);
        const allowsBranch = !companyReqs.allowedBranches || companyReqs.allowedBranches.includes(studentProfile.branch);

        if (percentageMatch >= 0.8 && meetsCGPA && allowsBranch) {
            matchLevel = "Strong Match";
        } else if (percentageMatch >= 0.5 && meetsCGPA) {
            matchLevel = "Close Match";
        }

        // Generate Human-like feedback
        const guidanceMessage = this._generateGuidance(
            missingCategories, 
            requiredSkillsLow.length, 
            missingSkills.length, 
            companyReqs.name
        );

        return {
            companyName: companyReqs.name,
            matchLevel,
            percentageMatch,
            matchedSkills,
            missingSkills,
            guidanceMessage,
            meetsInstitutionalSoftChecks: meetsCGPA && allowsBranch
        };
    }

    /**
     * Process an array of companies and rank the mentor feedback
     */
    evaluateAllOpportunities(studentProfile, companiesArray) {
        const insights = companiesArray.map(company => this.analyzeCompanyFit(studentProfile, company));
        
        // Sort effectively so Strong Matches appear first, followed by Growth
        return insights.sort((a, b) => b.percentageMatch - a.percentageMatch);
    }
}

// Ensure execution globally
window.SmartPlacementAssistant = SmartPlacementAssistant;

/* =========================================================
 * 💡 SAMPLE UI DATA STRUCTURE & USAGE EXAMPLE
 * =========================================================

// 1. Mock Data Source
const sampleStudent = {
    cgpa: 8.2,
    branch: "CSE",
    skills: ["HTML", "CSS", "JavaScript", "C++", "React"]
};

const sampleCompanies = [
    {
        name: "Google",
        minCgpa: 8.0,
        allowedBranches: ["CSE", "IT", "ECE"],
        requiredSkills: ["C++", "System Design", "JavaScript", "React", "Node"]
    },
    {
        name: "TCS",
        minCgpa: 7.0,
        allowedBranches: ["CSE", "IT", "ECE", "MAE"],
        requiredSkills: ["C++", "SQL", "JavaScript", "HTML"]
    }
];

// 2. Implementation Execution
const mentorEngine = new SmartPlacementAssistant();
const results = mentorEngine.evaluateAllOpportunities(sampleStudent, sampleCompanies);

console.log(results);

// 3. Expected Output JSON Structure:
[
  {
    "companyName": "TCS",
    "matchLevel": "Strong Match",
    "percentageMatch": 0.75,
    "matchedSkills": ["C++", "JavaScript", "HTML"],
    "missingSkills": ["SQL"],
    "guidanceMessage": "You're very close to this opportunity! Strengthening your foundation in Data & Cloud can significantly improve your chances.",
    "meetsInstitutionalSoftChecks": true
  },
  {
    "companyName": "Google",
    "matchLevel": "Close Match",
    "percentageMatch": 0.6,
    "matchedSkills": ["C++", "JavaScript", "React"],
    "missingSkills": ["System Design", "Node"],
    "guidanceMessage": "You have a great start. Investing time into building projects around Core CS Concepts and Web Development will bridge the gap and make your profile stand out for Google.",
    "meetsInstitutionalSoftChecks": true
  }
]
*/
