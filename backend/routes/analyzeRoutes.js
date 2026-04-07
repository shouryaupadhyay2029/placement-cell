const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

/**
 * Smart Placement Assistant Engine (Backend Logic)
 */
const skillCategories = {
    "DSA & Problem Solving": ["ds", "algo", "data structures", "algorithms", "problem solving", "cp", "competitive programming", "c++", "java"],
    "Web Development": ["html", "css", "javascript", "react", "node", "express", "angular", "vue", "frontend", "backend", "fullstack", "nextjs"],
    "Data & Cloud": ["sql", "mysql", "mongodb", "aws", "gcp", "azure", "docker", "kubernetes", "cloud", "database"],
    "Core CS Concepts": ["os", "dbms", "cn", "computer networks", "operating systems", "oops", "object oriented programming", "system design"]
};

function categorizeSkill(skill) {
    const lowerSkill = skill.toLowerCase();
    for (const [category, keywords] of Object.entries(skillCategories)) {
        if (keywords.includes(lowerSkill)) return category;
    }
    return "Specialized/Other Skills";
}

function generateGuidance(missingCategories, totalRequired, missingCount, companyName) {
    if (missingCount === 0) {
        return `Excellent match! Your skill profile aligns perfectly with what ${companyName} is looking for. Focus on refining your interview presence.`;
    }

    const matchRatio = (totalRequired - missingCount) / totalRequired;
    const missingList = Object.keys(missingCategories).join(" and ");

    if (matchRatio >= 0.7) {
        return `You're very close to this opportunity! Strengthening your foundation in ${missingList} can significantly improve your chances here.`;
    } else if (matchRatio >= 0.4) {
        return `You have a great start. Investing time into building projects around ${missingList} will bridge the gap.`;
    } else {
        return `This is a great growth opportunity! ${companyName} emphasizes ${missingList}. Consider exploring targeted courses in these areas.`;
    }
}

function getCompSkills(c) {
    let skills = [];
    if (c.skills) {
        if (Array.isArray(c.skills)) skills = c.skills;
        else if (typeof c.skills === 'string') skills = c.skills.split(',').map(s => s.trim());
        else if (typeof c.skills === 'object') {
            const core = Array.isArray(c.skills.core) ? c.skills.core : (typeof c.skills.core === 'string' ? c.skills.core.split(',') : []);
            const prog = Array.isArray(c.skills.programming) ? c.skills.programming : (typeof c.skills.programming === 'string' ? c.skills.programming.split(',') : []);
            skills = [...core, ...prog];
        }
    }
    if (skills.length === 0) {
        let req = c.required_skills || c.requiredSkills || [];
        if (typeof req === 'string') req = req.split(',');
        skills = req;
    }
    return skills.map(s => s.trim()).filter(Boolean);
}

/**
 * @route   POST /api/analyze
 * @desc    Analyzes user profile against all available placement companies
 */
router.post('/', async (req, res) => {
    try {
        const { cgpa, skills, branch } = req.body;
        
        if (!cgpa || !skills || !branch) {
            return res.status(400).json({ success: false, message: "Missing required fields: cgpa, skills, branch" });
        }

        const collegeContext = req.headers['x-college'] || 'USAR';
        
        // Fetch all active companies logically ready for intelligence
        const allCompanies = await Company.find({ college: collegeContext }).sort({ batch_year: -1 }).lean();
        
        const studentSkillsLow = skills.map(s => s.toLowerCase());

        let insights = allCompanies.map(company => {
            const companyName = company.companyName || company.company || company.company_name;
            const requiredSkills = getCompSkills(company);
            const requiredSkillsLow = requiredSkills.map(s => s.toLowerCase());

            let matchedSkills = [];
            let missingSkills = [];
            let missingCategories = {};

            requiredSkillsLow.forEach(skill => {
                const originalSkill = requiredSkills[requiredSkillsLow.indexOf(skill)];
                if (studentSkillsLow.includes(skill)) {
                    matchedSkills.push(originalSkill);
                } else {
                    missingSkills.push(originalSkill);
                    const category = categorizeSkill(skill);
                    missingCategories[category] = (missingCategories[category] || 0) + 1;
                }
            });

            const percentageMatch = requiredSkillsLow.length > 0 ? Math.round((matchedSkills.length / requiredSkillsLow.length) * 100) : 100;
            
            const minCgpa = parseFloat(String(company.cgpa || company.eligibility?.cgpa || 0).match(/(\d+(\.\d+)?)/)?.[0] || 0);
            const meetsCGPA = cgpa >= minCgpa;
            
            const allowedBranches = String(company.academics || company.eligibility?.academics || "All").toLowerCase();
            const allowsBranch = allowedBranches.includes("all") || allowedBranches.includes(branch.toLowerCase());

            let matchLevel = "Growth Needed";
            let status = "improve";

            if (!meetsCGPA || !allowsBranch) {
                matchLevel = "Ineligible by College Rules";
                status = "ineligible";
            } else if (percentageMatch >= 70) {
                matchLevel = "Strong Match";
                status = "eligible";
            } else if (percentageMatch >= 40) {
                matchLevel = "Close Match";
                status = "improve";
            }

            const guidanceMessage = generateGuidance(missingCategories, requiredSkillsLow.length, missingSkills.length, companyName);

            return {
                id: company._id,
                companyName,
                role: (company.roles && company.roles.length) ? company.roles[0] : (company.role || "Technical Role"),
                package: company.package || "TBD",
                matchLevel,
                status,
                matchPercentage: percentageMatch,
                matchedSkills,
                missingSkills,
                guidanceMessage,
                meetsInstitutionalSoftChecks: meetsCGPA && allowsBranch,
                reasons: { cgpaOk: meetsCGPA, branchOk: allowsBranch }
            };
        });

        // Filter out unique companies, prioritizing nearest batch
        const uniqueNames = [...new Set(insights.map(c => c.companyName))].sort();
        insights = uniqueNames.map(name => {
            return insights.filter(c => c.companyName === name)[0];
        });

        res.status(200).json(insights.sort((a, b) => b.matchPercentage - a.matchPercentage));
    } catch (error) {
        console.error("❌ Analysis Error:", error);
        res.status(500).json({ success: false, message: "Internal server error analyzing eligibility" });
    }
});

module.exports = router;
