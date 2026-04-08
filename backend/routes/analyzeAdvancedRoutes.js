const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────
//  1. SKILL INTELLIGENCE DATABASE
// ─────────────────────────────────────────────
const SKILLS = {
    // ── Core CS ─────────────────────────────
    dsa:           { name: "Data Structures & Algorithms", category: "Core CS",     importance: "HIGH",   demand: "VERY_HIGH", gapType: "core",         description: "The #1 filter in product-company interviews worldwide." },
    os:            { name: "Operating Systems",            category: "Core CS",     importance: "HIGH",   demand: "HIGH",      gapType: "core",         description: "Fundamental for system-level thinking and low-level design." },
    dbms:          { name: "Database Management",          category: "Core CS",     importance: "HIGH",   demand: "VERY_HIGH", gapType: "core",         description: "Essential for backend roles, data pipelines, and architecture." },
    oops:          { name: "OOP Concepts",                 category: "Core CS",     importance: "HIGH",   demand: "VERY_HIGH", gapType: "core",         description: "The universal language of scalable, maintainable software." },
    cn:            { name: "Computer Networks",            category: "Core CS",     importance: "MEDIUM", demand: "MEDIUM",    gapType: "core",         description: "Valuable for backend scalability and distributed system design." },
    "system design": { name: "System Design",             category: "Core CS",     importance: "HIGH",   demand: "MEDIUM",    gapType: "practical",    description: "Critical for senior roles and high-impact architecture interviews." },
    // ── Development ─────────────────────────
    html:          { name: "HTML / CSS",                   category: "Development", importance: "MEDIUM", demand: "HIGH",      gapType: "practical",    description: "The building blocks of every user-facing interface." },
    javascript:    { name: "JavaScript",                   category: "Development", importance: "HIGH",   demand: "VERY_HIGH", gapType: "practical",    description: "The backbone of modern web — front and back." },
    react:         { name: "React",                        category: "Development", importance: "HIGH",   demand: "HIGH",      gapType: "practical",    description: "The dominant framework for building scalable frontends." },
    node:          { name: "Node.js",                      category: "Development", importance: "HIGH",   demand: "HIGH",      gapType: "practical",    description: "Scalable server-side runtime that completes your full-stack." },
    java:          { name: "Java",                         category: "Development", importance: "HIGH",   demand: "VERY_HIGH", gapType: "practical",    description: "Enterprise-dominant language with massive hiring demand." },
    python:        { name: "Python",                       category: "Development", importance: "HIGH",   demand: "VERY_HIGH", gapType: "practical",    description: "Versatile language for backend, ML, scripting, and data." },
    // ── Data & AI ───────────────────────────
    sql:           { name: "SQL",                          category: "Data",        importance: "HIGH",   demand: "VERY_HIGH", gapType: "core",         description: "Expected in almost every backend, data, and analytics role." },
    ml:            { name: "Machine Learning",             category: "Data",        importance: "MEDIUM", demand: "MEDIUM",    gapType: "enhancement",  description: "Niche but rapidly growing — a differentiator for data roles." },
    // ── Tools ────────────────────────────────
    git:           { name: "Git / Version Control",        category: "Tools",       importance: "HIGH",   demand: "VERY_HIGH", gapType: "practical",    description: "A professional non-negotiable — every team uses it." },
    docker:        { name: "Docker",                       category: "Tools",       importance: "MEDIUM", demand: "MEDIUM",    gapType: "enhancement",  description: "Adds significant credibility for DevOps and backend roles." },
};

// ─────────────────────────────────────────────
//  2. SYNONYM MAP
// ─────────────────────────────────────────────
const SYNONYMS = {
    "js": "javascript", "reactjs": "react", "react.js": "react", "vue": "javascript",
    "node.js": "node", "nodejs": "node", "express": "node", "express.js": "node",
    "algo": "dsa", "algorithms": "dsa", "data structures": "dsa", "competitive programming": "dsa", "cp": "dsa",
    "oop": "oops", "object oriented": "oops", "c++": "dsa",
    "mysql": "sql", "postgresql": "sql", "postgres": "sql", "mongodb": "dbms",
    "machine learning": "ml", "artificial intelligence": "ml", "ai": "ml", "deep learning": "ml",
    "css": "html",
};

function normalizeSkills(skills) {
    return [...new Set(
        skills.map(s => {
            const c = s.trim().toLowerCase();
            return SYNONYMS[c] || c;
        }).filter(Boolean)
    )];
}

// ─────────────────────────────────────────────
//  3. PROFILE TYPE DETECTION
// ─────────────────────────────────────────────
const PROFILE_SIGNATURES = {
    Developer: ["javascript", "react", "node", "html", "java"],
    Data:      ["python", "ml", "sql", "dbms"],
    "Core CS": ["dsa", "os", "oops", "cn"],
};

const PROFILE_BADGES = {
    Developer: { icon: "💻", color: "#60a5fa", label: "Full-Stack Developer" },
    Data:      { icon: "📊", color: "#a78bfa", label: "Data & Analytics Engineer" },
    "Core CS": { icon: "🧮", color: "#f59e0b", label: "CS Fundamentals" },
    Hybrid:    { icon: "⚡", color: "#10b981", label: "Versatile Hybrid Engineer" },
    Starter:   { icon: "🌱", color: "#f87171", label: "Emerging Talent" },
};

function detectProfileType(userSkills) {
    const scores = {};
    for (const [type, sigs] of Object.entries(PROFILE_SIGNATURES)) {
        scores[type] = sigs.filter(s => userSkills.includes(s)).length;
    }
    const top  = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const best = top[0];

    if (best[1] === 0)        return "Starter";
    if (top.filter(t => t[1] >= best[1] - 1 && t[1] > 0).length >= 2) return "Hybrid";
    return best[0];
}

// ─────────────────────────────────────────────
//  4. MULTI-TEMPLATE DYNAMIC RESPONSE ENGINE
// ─────────────────────────────────────────────
const INSIGHT_TEMPLATES = {
    Starter: [
        "Every strong engineer started exactly where you are. Building your first two or three core skills will create momentum that compounds quickly — the first step is always the most powerful.",
        "You're at the beginning of an exciting journey. Picking one strong foundation — DSA or a language like Python — and mastering it will unlock every door ahead of you.",
    ],
    Developer: [
        "You have a strong practical foundation in development. Investing in problem-solving depth through DSA will transform you from someone who builds projects into someone who builds systems — and that's what top companies look for.",
        "Your development skills are genuinely valuable. The differentiator at this stage is pairing your practical knowledge with core CS fundamentals, especially DSA and system design, which will make you competitive for product roles.",
    ],
    Data: [
        "You have solid data skills that many engineers lack. Strengthening your CS fundamentals — especially DBMS and system design — will make you exceptionally well-rounded for analytical and engineering roles alike.",
        "Your data profile is valuable in today's market. Adding algorithmic thinking through DSA will elevate you into roles that combine both data fluency and engineering depth.",
    ],
    "Core CS": [
        "Your theoretical foundation is strong and sets you apart from many candidates. Now is the perfect time to channel that knowledge into practical projects — build something real with your skills and recruiters will take notice.",
        "You have excellent fundamentals. The most powerful next move is bridging the gap between theory and practice: build a project that demonstrates your CS knowledge in a real application.",
    ],
    Hybrid: [
        "You have a genuinely versatile profile that spans multiple disciplines. This is rare and valuable. Deepening expertise in even one direction will make you exceptionally competitive — consider which area energizes you most.",
        "Your cross-domain skills give you perspective that specialists often lack. Your next step is to pick a direction to go deep — specialization at this stage multiplies your market value significantly.",
    ],
};

const STRENGTH_NOTES = {
    "dsa":           "A critical differentiator that shows algorithmic thinking — exactly what product companies test for.",
    "javascript":    "Highly marketable in virtually every modern tech team — you're already ahead of many peers.",
    "python":        "One of the most versatile and demanded languages — opens doors across backend, data, and scripting.",
    "react":         "The dominant UI framework right now — product companies value this heavily.",
    "sql":           "Database fluency is increasingly expected even in non-data roles — this is a strong asset.",
    "java":          "Enterprise backbone that's required in a huge portion of backend roles.",
    "git":           "A professional basic that shows you're ready to work collaboratively in real teams.",
    "node":          "Full-stack capability is a major advantage — you can build end-to-end independently.",
    "oops":          "The design foundation that makes code scalable — highly valued in code reviews.",
    "dbms":          "Strong database knowledge is a decisive edge for backend and architect roles.",
    "os":            "System awareness that most developers lack — genuinely impressive in interviews.",
};

const GAP_CONTEXT = {
    core:        { label: "Foundation Gaps",   color: "#ef4444", icon: "⚠", note: "These are fundamental skills — prioritise them first." },
    practical:   { label: "Practical Gaps",    color: "#f59e0b", icon: "→", note: "Real-world skills that employers actively look for." },
    enhancement: { label: "Growth Areas",      color: "#60a5fa", icon: "↑", note: "Optional but powerful differentiators once your base is solid." },
};

const TREND_POOL = [
    "DSA remains the single most critical filter in product-based company hiring — nearly 90% of online assessments test it.",
    "Full-stack proficiency (React + Node.js or Python/Django) commands the highest demand in campus placement cycles.",
    "SQL is now an expectation even in frontend and mobile roles — data literacy has become universal.",
    "Git-based version control is a professional baseline — candidates without it are at a structural disadvantage.",
    "Machine learning roles are growing fast, but require strong CS fundamentals as a prerequisite.",
    "System Design is becoming a standard interview round at mid-to-senior levels, even for fresh graduates at top firms.",
    "Java remains the dominant language in enterprise and banking sector hiring — large, stable pool of opportunities.",
    "Python's versatility makes it the most beginner-friendly and simultaneously most powerful language in the current market.",
];

function pick(arr, n = 3) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
}

function pickTemplate(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

// ─────────────────────────────────────────────
//  5. ROADMAP GENERATOR
// ─────────────────────────────────────────────
function buildRoadmap(profileType, userSkills, coreGaps, practicalGaps) {
    const hasDSA     = userSkills.includes("dsa");
    const hasProject = userSkills.some(s => ["react","node","javascript","python"].includes(s));
    const hasGit     = userSkills.includes("git");
    const steps      = [];

    if (!hasDSA) {
        steps.push("Start with DSA fundamentals: arrays, strings, and recursion. Even 30 minutes daily creates compounding improvement over weeks.");
    }
    if (coreGaps.length > 0 && !hasDSA) {
        steps.push(`Alongside DSA, invest time in ${coreGaps[0].skill} — it's a foundational gap that'll surface in most technical evaluations.`);
    }

    if (profileType === "Developer" || userSkills.includes("javascript") || userSkills.includes("react")) {
        if (!userSkills.includes("node")) {
            steps.push("You know frontend — adding Node.js will unlock full-stack capability and roughly double your available roles.");
        }
        if (hasDSA) {
            steps.push("Build one complete full-stack project that solves a real problem. Deployed projects in a portfolio are worth more than most certifications.");
        }
    }

    if (profileType === "Data" || userSkills.includes("python")) {
        if (!userSkills.includes("sql")) {
            steps.push("SQL is a prerequisite for virtually any data role — it's quick to learn and immediately useful.");
        }
        steps.push("Complete one end-to-end data project — data collection, cleaning, analysis, and visualization in a single cohesive story.");
    }

    if (profileType === "Core CS") {
        steps.push("Apply your CS knowledge by building a project — even a simple REST API or CLI tool demonstrates your fundamentals in action.");
    }

    if (!hasGit) {
        steps.push("Learn Git this week — branches, commits, pull requests. It's the single fastest win available to you right now.");
    }

    if (hasDSA && hasProject) {
        steps.push("Begin structured interview preparation: mock interviews, timed problems, and reviewing common system design questions.");
    }

    if (steps.length === 0) {
        steps.push("Focus on going deep rather than broad — pick your strongest skill and build something genuinely impressive with it.");
        steps.push("Document your projects clearly on GitHub and LinkedIn — visibility matters as much as skill at this stage.");
    }

    return steps.slice(0, 5);
}

// ─────────────────────────────────────────────
//  ROUTE: POST /api/analyze-advanced
// ─────────────────────────────────────────────
router.post('/', (req, res) => {
    try {
        const { skills, cgpa, branch } = req.body;
        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide at least one skill to analyze." });
        }

        const userSkills = normalizeSkills(skills);
        const profileType = detectProfileType(userSkills);
        const badge = PROFILE_BADGES[profileType] || PROFILE_BADGES.Starter;

        // ── Strengths ──────────────────────
        const strengths = [];
        for (const us of userSkills) {
            if (SKILLS[us]) {
                strengths.push({
                    skill:    SKILLS[us].name,
                    reason:   STRENGTH_NOTES[us] || SKILLS[us].description,
                    category: SKILLS[us].category,
                });
            } else if (us.length > 1) {
                const display = us.charAt(0).toUpperCase() + us.slice(1);
                strengths.push({ skill: display, reason: "A practical skill that adds real-world breadth to your profile.", category: "Specialized" });
            }
        }

        // ── Gap Analysis ────────────────────
        const gaps = { core: [], practical: [], enhancement: [] };
        for (const [key, meta] of Object.entries(SKILLS)) {
            if (!userSkills.includes(key)) {
                gaps[meta.gapType].push({ skill: meta.name, importance: meta.importance, reason: meta.description });
            }
        }

        // ── High Impact Skills ──────────────
        const highImpactSkills = Object.entries(SKILLS)
            .filter(([k, m]) => !userSkills.includes(k) && (m.importance === "HIGH" || m.demand === "VERY_HIGH"))
            .sort((a, b) => (b[1].demand === "VERY_HIGH" ? 1 : 0) - (a[1].demand === "VERY_HIGH" ? 1 : 0))
            .slice(0, 4)
            .map(([, m]) => m.name);

        // ── Insight ────────────────────────
        const templatePool = INSIGHT_TEMPLATES[profileType] || INSIGHT_TEMPLATES.Starter;
        const insights = pickTemplate(templatePool);

        // ── Trends ─────────────────────────
        const trends = pick(TREND_POOL, 4);

        // ── Roadmap ────────────────────────
        const roadmap = buildRoadmap(profileType, userSkills, gaps.core, gaps.practical);

        return res.status(200).json({
            success: true,
            profileType,
            badge,
            strengths,
            gaps,
            highImpactSkills,
            insights,
            roadmap,
            trends,
        });

    } catch (err) {
        console.error("❌ Smart Mentor Engine:", err);
        return res.status(500).json({ success: false, message: "The analysis engine encountered an error. Please try again." });
    }
});

module.exports = router;
