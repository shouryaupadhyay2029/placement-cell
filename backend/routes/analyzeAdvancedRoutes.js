const express = require('express');
const router = express.Router();

/**
 * GLOBAL SKILL INTELLIGENCE LAYER
 */
const skillDictionary = {
    // Core CS
    "dsa":           { name: "Data Structures & Algorithms", category: "Core CS",     importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "Required in almost all coding interviews at top companies." },
    "os":            { name: "Operating Systems",            category: "Core CS",     importance: "HIGH",   demandFrequency: "HIGH",      description: "Critical for understanding system-level and low-level concepts." },
    "dbms":          { name: "Database Management",          category: "Core CS",     importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "Essential for data modelling, queries, and backend architecture." },
    "cn":            { name: "Computer Networks",            category: "Core CS",     importance: "MEDIUM", demandFrequency: "MEDIUM",    description: "Important for scalable backend and distributed systems design." },
    "system design": { name: "System Design",                category: "Core CS",     importance: "HIGH",   demandFrequency: "MEDIUM",    description: "Crucial for senior engineering and architecture interviews." },
    "oops":          { name: "OOP Concepts",                 category: "Core CS",     importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "The foundation of scalable, maintainable software." },
    // Development
    "html":          { name: "HTML / CSS",                   category: "Development", importance: "MEDIUM", demandFrequency: "HIGH",      description: "The core building blocks of any user interface." },
    "javascript":    { name: "JavaScript",                   category: "Development", importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "The backbone of modern interactive web applications." },
    "react":         { name: "React",                        category: "Development", importance: "HIGH",   demandFrequency: "HIGH",      description: "Highly demanded framework for building dynamic frontends." },
    "node":          { name: "Node.js",                      category: "Development", importance: "HIGH",   demandFrequency: "HIGH",      description: "Scalable server-side JavaScript runtime." },
    "express":       { name: "Express.js",                   category: "Development", importance: "MEDIUM", demandFrequency: "HIGH",      description: "Fast, minimalist backend web framework for Node." },
    "java":          { name: "Java",                         category: "Development", importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "Enterprise-grade language dominant in product companies." },
    // Data & Tools
    "python":        { name: "Python",                       category: "Data",        importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "Versatile language central to ML, data, and scripting." },
    "sql":           { name: "SQL",                          category: "Data",        importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "Fundamental skill for any backend or data role." },
    "git":           { name: "Git / Version Control",        category: "Tools",       importance: "HIGH",   demandFrequency: "VERY_HIGH", description: "Absolute requirement for professional team-based development." },
    "docker":        { name: "Docker",                       category: "Tools",       importance: "MEDIUM", demandFrequency: "MEDIUM",    description: "Standardises development and production environments." }
};

// Synonyms → canonical dictionary keys
const synonyms = {
    "js": "javascript", "reactjs": "react", "react.js": "react",
    "node.js": "node", "nodejs": "node",
    "algo": "dsa", "algorithms": "dsa", "data structures": "dsa",
    "cpp": "c++", "c plus plus": "c++",
    "oop": "oops", "object oriented": "oops",
    "mysql": "sql", "postgresql": "sql", "postgres": "sql"
};

function normalizeSkills(skills) {
    return skills.map(s => {
        const clean = s.trim().toLowerCase();
        return synonyms[clean] || clean;
    }).filter(Boolean);
}

function generateInsight(strCount, missingCount, hasCore, hasDev) {
    if (strCount === 0) {
        return "Every expert was once a beginner! Start building your foundation in one area — even one strong skill opens the first door.";
    }
    if (strCount <= 2 && missingCount > 6) {
        return "You're at an exciting starting point! Focusing on one or two foundational skills consistently will create rapid momentum in your profile.";
    }
    if (hasDev && !hasCore) {
        return "You have a strong grasp of practical development tools. Grounding yourself in Core CS fundamentals like DSA and DBMS will unlock top-tier opportunities that currently feel out of reach.";
    }
    if (hasCore && !hasDev) {
        return "Your theoretical foundation is solid! Pairing it with hands-on development skills — like building real projects with React or Node.js — will make your profile irresistible to recruiters.";
    }
    if (strCount >= 6 && missingCount <= 3) {
        return "Your profile is genuinely impressive and well-rounded. The next step is depth — specializing in one domain and demonstrating it through a standout project will set you apart completely.";
    }
    return "You have a solid base to build on. Systematically closing a few key gaps will rapidly accelerate your competitiveness across the industry.";
}

/**
 * @route  POST /api/analyze-advanced
 * @desc   AI Mentor Guidance Engine — dictionary-driven, zero DB dependency
 */
router.post('/', (req, res) => {
    try {
        const { cgpa, skills, branch } = req.body;

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide at least one skill." });
        }

        const userSkills = normalizeSkills(skills);
        const strengths  = [];
        const missingDict = {};

        // Map against dictionary
        for (const [key, meta] of Object.entries(skillDictionary)) {
            if (userSkills.includes(key)) {
                strengths.push({ skill: meta.name, reason: meta.description, category: meta.category });
            } else {
                missingDict[key] = meta;
            }
        }

        // Credit unrecognised skills the user typed
        for (const us of userSkills) {
            if (!skillDictionary[us] && us.length > 1 && !strengths.find(s => s.skill.toLowerCase() === us)) {
                strengths.push({
                    skill: us.charAt(0).toUpperCase() + us.slice(1),
                    reason: "A valuable addition to your toolkit that shows initiative and range.",
                    category: "Specialized"
                });
            }
        }

        // Build prioritised missing list
        const highPriorityMissing = Object.entries(missingDict)
            .filter(([, m]) => m.importance === "HIGH" || m.demandFrequency === "VERY_HIGH")
            .map(([, m]) => ({ skill: m.name, importance: m.importance, reason: m.description }))
            .slice(0, 5);

        const highImpactSkills = highPriorityMissing.map(m => m.skill).slice(0, 4);

        // Human-like insight
        const hasCore = userSkills.some(s => ["dsa", "dbms", "os", "oops"].includes(s));
        const hasDev  = userSkills.some(s => ["javascript", "react", "node", "java", "python"].includes(s));
        const insights = generateInsight(strengths.length, Object.keys(missingDict).length, hasCore, hasDev);

        // Personalised roadmap
        const roadmap = [];
        if (userSkills.length <= 2) {
            roadmap.push("Build a strong habit of coding daily — even 30 minutes creates compounding results.");
            roadmap.push("Pick one language (Python or JavaScript) and master its core syntax before branching out.");
        } else {
            if (highPriorityMissing.length > 0) {
                roadmap.push(`Make ${highPriorityMissing[0].skill} your focused learning goal for the next 3–4 weeks.`);
            }
            if (!hasCore) {
                roadmap.push("Spend 20–30 minutes daily on Core CS: DSA problem solving, OS concepts, and DBMS basics.");
            }
            roadmap.push("Build one complete, end-to-end project that demonstrates your stack — this matters more than certifications.");
            if (userSkills.includes("react") && !userSkills.includes("node")) {
                roadmap.push("You already know React — adding Node.js next will make you full-stack and widen your opportunities dramatically.");
            }
            if (!userSkills.includes("git")) {
                roadmap.push("Learn Git this weekend — it's a professional requirement and takes only a day to get started.");
            }
        }

        // Static market trends
        const trends = [
            "DSA remains the #1 filter in product-based company interviews and most competitive startups.",
            "Full-stack skills (React + Node.js or Python/Django) are seeing the highest demand in campus placements.",
            "SQL and data handling are now expected even in frontend and mobile engineering roles.",
            "Git and basic cloud familiarity are becoming table-stakes requirements, not differentiators."
        ];

        return res.status(200).json({
            success: true,
            strengths,
            missingSkills: highPriorityMissing,
            highImpactSkills,
            insights,
            roadmap,
            trends
        });

    } catch (error) {
        console.error("❌ Mentor Analysis Engine:", error);
        return res.status(500).json({ success: false, message: "Analysis engine encountered an error. Please try again." });
    }
});

module.exports = router;
