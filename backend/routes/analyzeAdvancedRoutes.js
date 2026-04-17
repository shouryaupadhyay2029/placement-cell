/**
 * ═══════════════════════════════════════════════════════════════
 *  SMART PLACEMENT ASSISTANT — Intelligence Engine v4.1
 *  Production-grade. Bulletproof pipeline. Zero silent failures.
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const router  = express.Router();

// ─────────────────────────────────────────────────────────────
//  MODULE 1: FULL SKILL DATABASE
// ─────────────────────────────────────────────────────────────
const SKILL_DB = {
    dsa: {
        id:'dsa', name:'Data Structures & Algorithms',
        domain:'core_fundamentals', tier:1, weight:10,
        capabilities: ['algorithmic efficiency', 'logic optimization', 'complex problem solving'],
        naturalGaps: ['real-world application integration', 'architectural system design'],
        difficulty:'Hard', difficultyScore:8, estimatedWeeks:12, dailyHours:2, demandScore:98,
        complementaryTo:['java','cpp','python','javascript'], prerequisites:[],
        whyItMatters:'Primary technical filter for product companies. Mandatory for clearing algorithmic screening rounds.',
        impactIfIgnored:'Immediate disqualification at initial screening stage for 90% of product-based roles.',
        roadmap:{
            beginner:['Arrays & Strings → 2 Easy LeetCode/day','Sorting & Searching fundamentals','Recursion basics → Factorial, Fibonacci, Power'],
            intermediate:['Linked Lists, Stacks, Queues','Trees (BST, traversals, height)','Hashing & Two-Pointer technique'],
            advanced:['Graphs — DFS, BFS, Dijkstra, Bellman-Ford','Dynamic Programming patterns','Segment Trees, Tries, Advanced Graphs']
        },
        monthlyPlan:[
            'Week 1: Arrays — prefix sums, sliding window, two pointers. 2 LeetCode Easys daily.',
            'Week 2: Sorting — implement Merge Sort & Quick Sort from scratch.',
            'Week 3: Recursion — subsets, permutations, combination sum.',
            'Week 4: Trees — inorder/preorder/postorder, BST operations, LCA.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/data-structures/',practice:'https://leetcode.com/problemset/',guide:'https://neetcode.io/roadmap'},
        youtube:[
            {title:'DSA Full Course – Abdul Bari',url:'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O'},
            {title:'Striver DSA Sheet – Take U Forward',url:'https://www.youtube.com/watch?v=0bHoB32fuj0'}
        ]
    },

    oops: {
        id:'oops', name:'Object Oriented Programming',
        domain:'core_fundamentals', tier:1, weight:9,
        capabilities: ['modular design', 'abstraction', 'class-based architecture'],
        naturalGaps: ['functional programming patterns', 'low-level memory optimization'],
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:3, dailyHours:1, demandScore:92,
        complementaryTo:['java','cpp','python'], prerequisites:[],
        whyItMatters:'Standard design paradigm for production codebases and high-level system architecture.',
        impactIfIgnored:'Inability to design maintainable systems or clear core engineering rounds.',
        roadmap:{
            beginner:['Classes, Objects, Encapsulation','Inheritance — single & multi-level','Polymorphism — overloading vs overriding'],
            intermediate:['Abstraction, Interfaces, Abstract Classes','SOLID Principles with code examples','Composition vs Inheritance'],
            advanced:['Design Patterns — Singleton, Factory, Observer, Strategy','Dependency Injection','Domain-Driven Design concepts']
        },
        monthlyPlan:[
            'Week 1: Master 4 pillars — code examples in your primary language.',
            'Week 2: Implement Singleton, Factory, Builder design patterns.',
            'Week 3: Refactor an existing project to apply SOLID principles.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/',practice:'https://www.geeksforgeeks.org/oops-interview-questions/',guide:'https://refactoring.guru/design-patterns'},
        youtube:[
            {title:'OOP Concepts in 10 min – Web Dev Simplified',url:'https://www.youtube.com/watch?v=pTB0EiLXUC8'},
            {title:'SOLID Principles Explained – Fireship',url:'https://www.youtube.com/watch?v=XzdhzyAukMM'}
        ]
    },

    dbms: {
        id:'dbms', name:'Database Management (DBMS & SQL)',
        domain:'core_fundamentals', tier:1, weight:9,
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:4, dailyHours:1, demandScore:92,
        complementaryTo:['backend','node','java','python'], prerequisites:[],
        whyItMatters:'Foundational for applications requiring state persistence. Core requirement for backend/full-stack interviews.',
        impactIfIgnored:'Ineligibility for any backend role; failure to pass data-layer design rounds.',
        roadmap:{
            beginner:['SQL — SELECT, WHERE, JOIN (INNER, LEFT, RIGHT)','ER Diagrams and schema design','Normalization — 1NF, 2NF, 3NF'],
            intermediate:['Indexing — B-Trees, Hash Indexes, Composite','ACID Properties & Transactions','Stored Procedures, Triggers, Views'],
            advanced:['Query Optimization & Execution Plans','CAP Theorem & Distributed Databases','NoSQL trade-offs — MongoDB vs PostgreSQL']
        },
        monthlyPlan:[
            'Week 1: SQL mastery — complex JOINs, GROUP BY, HAVING, subqueries.',
            'Week 2: Normalization — practice schema design from requirements.',
            'Week 3: Transactions, ACID, and Isolation Levels with examples.',
            'Week 4: Indexing theory + LeetCode SQL problems 50+.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/dbms/',practice:'https://leetcode.com/tag/database/',guide:'https://www.geeksforgeeks.org/sql-tutorial/'},
        youtube:[
            {title:'SQL Full Course – Programming with Mosh',url:'https://www.youtube.com/watch?v=7S_tz1z_5bA'},
            {title:'DBMS Complete Course – Gate Smashers',url:'https://www.youtube.com/watch?v=kBdlM6hNDAE'}
        ]
    },
    os: {
        id:'os', name:'Operating Systems',
        domain:'core_fundamentals', tier:1, weight:7,
        capabilities: ['process management', 'memory mapping', 'io scheduling'],
        naturalGaps: ['kernel interaction', 'concurrent programming'],
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:4, dailyHours:1, demandScore:74,
        complementaryTo:['cpp','backend'], prerequisites:[],
        whyItMatters:'OS is tested in 70% of product company interviews.',
        impactIfIgnored:'Struggle with system-level interview questions and backend performance debugging.',
        links:{theory:'https://www.geeksforgeeks.org/operating-systems/',practice:'https://www.geeksforgeeks.org/operating-systems-interview-questions/',guide:'https://pages.cs.wisc.edu/~remzi/OSTEP/'},
        youtube:[
            {title:'OS Complete Course – Gate Smashers',url:'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p'}
        ]
    },

    cn: {
        id:'cn', name:'Computer Networks',
        domain:'core_fundamentals', tier:1, weight:6,
        capabilities: ['request routing', 'protocol handling', 'network security'],
        naturalGaps: ['backend integration', 'load balancing logic'],
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:3, dailyHours:1, demandScore:68,
        complementaryTo:['backend','devops'], prerequisites:[],
        whyItMatters:'Networking underpins everything on the internet.',
        impactIfIgnored:'Cannot meaningfully work on backend systems or explain web applications in interviews.',
        links:{theory:'https://www.geeksforgeeks.org/computer-network-tutorials/',practice:'https://www.geeksforgeeks.org/computer-networks-interview-questions/',guide:'https://roadmap.sh/system-design'},
        youtube:[
            {title:'CN Full Course – Gate Smashers',url:'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLBEVV'}
        ]
    },

    // ── Languages ────────────────────────────────────────────
    c: {
        id:'c', name:'C Programming',
        domain:'languages', tier:2, weight:7,
        capabilities: ['memory control', 'pointers', 'procedural logic', 'low-level optimization'],
        naturalGaps: ['architectural modularity', 'high-level application logic'],
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:6, dailyHours:1.5, demandScore:72,
        complementaryTo:['cpp','os','dsa'], prerequisites:[],
        whyItMatters:'C is the foundation of computer science. It teaches memory management, pointers, and systems thinking that makes you a better engineer in any language.',
        impactIfIgnored:'Miss out on embedded, systems, and firmware roles; limited understanding of how programs interact with hardware.'
    },
    cpp: {
        id:'cpp', name:'C++',
        domain:'languages', tier:2, weight:8,
        capabilities: ['manual memory management', 'performance optimization', 'system-level understanding', 'object-oriented system design'],
        naturalGaps: ['managed memory patterns', 'rapid application delivery'],
        difficulty:'Hard', difficultyScore:7, estimatedWeeks:8, dailyHours:1.5, demandScore:84,
        complementaryTo:['dsa','oops'], prerequisites:[],
        whyItMatters:'Industry standard for competitive programming and high-performance systems. STL mastery makes DSA faster to write and debug.',
        impactIfIgnored:'Slower in competitive programming and miss roles in finance, gaming, and system engineering.'
    },
    java: {
        id:'java', name:'Java',
        domain:'languages', tier:2, weight:9,
        capabilities: ['managed memory', 'enterprise architecture', 'multi-threading', 'jvm optimization'],
        naturalGaps: ['low-level control', 'hardware interaction'],
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:8, dailyHours:1.5, demandScore:90,
        complementaryTo:['oops','dsa','dbms','backend'], prerequisites:[],
        whyItMatters:'Java dominates enterprise hiring. Most hireable language in Indian campus placements.',
        impactIfIgnored:'Closed off from the largest segment of campus placement opportunities.'
    },

    python: {
        id:'python', name:'Python',
        domain:'languages', tier:2, weight:8,
        capabilities: ['interpreted logic', 'high-level automation', 'rapid prototyping', 'data handling'],
        naturalGaps: ['low-level system control', 'concurrent memory safety'],
        difficulty:'Easy', difficultyScore:3, estimatedWeeks:5, dailyHours:1, demandScore:88,
        complementaryTo:['dsa','ml','backend','dbms'], prerequisites:[],
        whyItMatters:'Most versatile language — AI/ML, backend APIs, scripting, and data engineering.',
        impactIfIgnored:'No access to the AI/ML ecosystem and reduced backend optionality.',
        links:{theory:'https://www.geeksforgeeks.org/python-programming-language/',practice:'https://leetcode.com/tag/python/',guide:'https://roadmap.sh/python'},
        youtube:[
            {title:'Python for Beginners – programmingwithmosh',url:'https://www.youtube.com/watch?v=_uQrJ0TkZlc'},
            {title:'Python Full Course – CodeWithHarry',url:'https://www.youtube.com/playlist?list=PLu0W_9lII9agWH1G9vvbe963_i_nSipGq'}
        ]
    },

    javascript: {
        id:'javascript', name:'JavaScript',
        domain:'languages', tier:2, weight:8,
        capabilities: ['asynchronous execution', 'event-driven architecture', 'functional programming', 'runtime event-loop handling'],
        naturalGaps: ['strict type safety', 'thread-based concurrency'],
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:6, dailyHours:1.5, demandScore:86,
        complementaryTo:['react','node','dsa'], prerequisites:[],
        whyItMatters:'The only language that runs natively in browsers and on servers.',
        impactIfIgnored:'Cannot build interactive frontends or JavaScript-based backends.',
        links:{theory:'https://javascript.info/',practice:'https://www.frontendmentor.io/',guide:'https://roadmap.sh/javascript'},
        youtube:[
            {title:'JS Explained – Namaste JavaScript',url:'https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCgwyqeWWm9UTw2yG'},
            {title:'JavaScript Full Course – SuperSimpleDev',url:'https://www.youtube.com/watch?v=EerdGm-ehJQ'}
        ]
    },


    // ── Development ──────────────────────────────────────────
    react: {
        id:'react', name:'React.js',
        domain:'frontend', tier:3, weight:7,
        capabilities: ['component-based UI', 'declarative state', 'vdom optimization'],
        naturalGaps: ['server-side synchronization', 'logic decoupling'],
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:6, dailyHours:1.5, demandScore:82,
        complementaryTo:['javascript','node','dsa'], prerequisites:['javascript'],
        whyItMatters:'Dominant frontend framework.',
        impactIfIgnored:'Frontend-focused opportunities become significantly limited without React.',
        links:{theory:'https://react.dev/learn',practice:'https://www.frontendmentor.io/challenges',guide:'https://roadmap.sh/react'},
        youtube:[
            {title:'React Course – CodeWithHarry',url:'https://www.youtube.com/playlist?list=PLu0W_9lII9agx6itCaadCP88Wdyux6xGi'}
        ]
    },

    node: {
        id:'node', name:'Node.js & Express',
        domain:'backend', tier:3, weight:7,
        capabilities: ['event-loop handling', 'non-blocking I/O', 'restful logic'],
        naturalGaps: ['computational complexity', 'heavy CPU tasking'],
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:5, dailyHours:1.5, demandScore:78,
        complementaryTo:['javascript','dbms','react'], prerequisites:['javascript'],
        whyItMatters:'Unlocks server-side JavaScript.',
        impactIfIgnored:'Remain a pure frontend developer, unable to build or understand backend systems.',
        links:{theory:'https://nodejs.dev/en/learn/',practice:'https://www.codecademy.com/learn/learn-node-js',guide:'https://roadmap.sh/nodejs'},
        youtube:[
            {title:'Node.js Tutorial – Programming with Mosh',url:'https://www.youtube.com/watch?v=TlB_eWDSMt4'}
        ]
    },

    git: {
        id:'git', name:'Git & GitHub',
        domain:'tools', tier:3, weight:6,
        difficulty:'Easy', difficultyScore:2, estimatedWeeks:1, dailyHours:0.5, demandScore:99,
        complementaryTo:['javascript','python','java','react','node'], prerequisites:[],
        whyItMatters:'Baseline professional requirement. Every tech company uses version control. A strong GitHub profile is a recruiter-visible portfolio.',
        impactIfIgnored:'Cannot work in a team environment and have no portfolio for recruiters to evaluate.',
        roadmap:{
            beginner:['git init, add, commit, push, status','Branching — create, switch, merge','Cloning repos, pulling changes'],
            intermediate:['Git rebase vs merge','Resolving merge conflicts','Pull Requests and code review flow'],
            advanced:['Git hooks for automation','GitHub Actions for CI/CD','Mono-repo management strategies']
        },
        monthlyPlan:[
            'Day 1-2: Initialize a repo, make commits, push to GitHub.',
            'Day 3-4: Create feature branches, merge them, resolve conflict.',
            'Day 5-7: Contribute to a public repo — fix docs or a small bug.'
        ],
        links:{theory:'https://www.atlassian.com/git/tutorials',practice:'https://learngitbranching.js.org/',guide:'https://roadmap.sh/git-github'}
    },
    docker: {
        id:'docker', name:'Docker & Containerization',
        domain:'devops_cloud', tier:4, weight:5,
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:3, dailyHours:1, demandScore:65,
        complementaryTo:['backend','node','python'], prerequisites:['node'],
        whyItMatters:'Solves environment consistency and is a standard in backend/DevOps workflows. Shows you can deploy and manage production systems.',
        impactIfIgnored:'Limited to local development — cannot participate in modern DevOps workflows.',
        roadmap:{
            beginner:['Docker images, containers, volumes','Writing a Dockerfile','docker run, build, ps, stop commands'],
            intermediate:['Docker Compose for multi-service apps','Networking between containers','Environment variables management'],
            advanced:['CI/CD with GitHub Actions','Container registries','Kubernetes fundamentals']
        },
        monthlyPlan:[
            'Week 1: Containerize a Node/Python app with Dockerfile.',
            'Week 2: Docker Compose — app + database + Redis.',
            'Week 3: GitHub Actions CI pipeline building and pushing Docker image.'
        ],
        links:{theory:'https://docs.docker.com/get-started/',practice:'https://labs.play-with-docker.com/',guide:'https://roadmap.sh/docker'}
    },
    sql: {
        id:'sql', name:'SQL & Relational Databases',
        domain:'data_science_ai', tier:2, weight:8,
        difficulty:'Medium', difficultyScore:4, estimatedWeeks:3, dailyHours:1, demandScore:90,
        complementaryTo:['backend','dbms','python','java'], prerequisites:[],
        whyItMatters:'Expected in virtually every technical interview — frontend, backend, and data roles all require SQL.',
        impactIfIgnored:'Cannot build or query any relational database, failing a major interview category.',
        roadmap:{
            beginner:['SELECT, WHERE, ORDER BY, LIMIT, DISTINCT','JOINs — INNER, LEFT, RIGHT, FULL','Aggregate functions — COUNT, SUM, GROUP BY, HAVING'],
            intermediate:['Subqueries and CTEs','Window functions — ROW_NUMBER, RANK, LAG/LEAD','Indexes and performance basics'],
            advanced:['Query optimization and EXPLAIN plans','Stored procedures and triggers','Partitioning and sharding strategies']
        },
        monthlyPlan:[
            'Week 1: SQL SELECT, JOINs, aggregations — HackerRank SQL Easy.',
            'Week 2: Window functions, CTEs, subqueries — LeetCode SQL.',
            'Week 3: Indexes, EXPLAIN, performance tuning.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/sql-tutorial/',practice:'https://leetcode.com/tag/database/',guide:'https://sqlzoo.net/'}
    },
    system_design: {
        id:'system_design', name:'System Design basics',
        domain:'core_fundamentals', tier:1, weight:8,
        difficulty:'Hard', difficultyScore:7, estimatedWeeks:6, dailyHours:1, demandScore:85,
        complementaryTo:['backend','node','java'], prerequisites:['dbms','oops'],
        whyItMatters:'Essential for scaling applications and clearing senior/product technical rounds.',
        impactIfIgnored:'Inability to design robust architectures; failure in high-level technical rounds.',
        roadmap:{
            beginner:['Horizontal vs Vertical scaling','Load Balancers & Reverse Proxies','Monolith vs Microservices'],
            intermediate:['Caching (Redis/Memcached)','Message Queues (Kafka/RabbitMQ)','Database Sharding & Replication'],
            advanced:['CAP Theorem & Consistency models','Service Discovery','Rate Limiting & Circuit Breakers']
        },
        monthlyPlan:[
            'Week 1: Scaling basics and Load Balancing principles.',
            'Week 2: Caching strategies and Redis implementation.',
            'Week 3: Database design for high availability.'
        ],
        links:{theory:'https://github.com/donnemartin/system-design-primer',practice:'https://www.educative.io/courses/grokking-the-system-design-interview',guide:'https://roadmap.sh/system-design'}
    },
    api_integration: {
        id:'api_integration', name:'API Integration & Auth',
        domain:'backend', tier:3, weight:7,
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:3, dailyHours:1.5, demandScore:80,
        complementaryTo:['javascript','react','node'], prerequisites:['javascript'],
        whyItMatters:'The backbone of modern interconnected applications. Connects frontend to backend and third-party services.',
        impactIfIgnored:'Apps remain static; unable to handle user data or external services securely.',
        roadmap:{
            beginner:['REST methods & Status codes','Fetch/Axios usage','JSON handling'],
            intermediate:['JWT & OAuth 2.0 implementation','Error handling & Interceptors','API Rate limiting basics'],
            advanced:['GraphQL integration','Webhook processing','Secure API architecture']
        },
        monthlyPlan:[
            'Week 1: Master RESTful principles and async fetching.',
            'Week 2: Implement JWT login and secure routes.',
            'Week 3: Integrate a third-party API (Paypal/Google/OpenAI).'
        ],
        links:{theory:'https://web.dev/articles/introduction-to-fetching-data',practice:'https://jsonplaceholder.typicode.com/',guide:'https://roadmap.sh/api-design'}
    },
    performance_optimization: {
        id:'performance_optimization', name:'Performance Optimization',
        domain:'frontend', tier:3, weight:6,
        difficulty:'Hard', difficultyScore:6, estimatedWeeks:4, dailyHours:1, demandScore:75,
        complementaryTo:['javascript','react','node'], prerequisites:['javascript'],
        whyItMatters:'Critical for high-traffic applications. Improves user experience and reduces server costs.',
        impactIfIgnored:'Slow load times; poor SEO; increased bounce rates.',
        roadmap:{
            beginner:['Lighthouse audits & DevTools Profiling','Images & Asset compression','Lazy loading basics'],
            intermediate:['React.memo & useMemo/useCallback','Code splitting & Tree shaking','Caching strategies (Service Workers)'],
            advanced:['Web Workers for background tasks','CRITICAL CSS & Resource prioritization','Performance monitoring at scale']
        },
        monthlyPlan:[
            'Week 1: Audit existing project with Lighthouse; fix core web vitals.',
            'Week 2: Implement lazy loading and memoization in React.',
            'Week 3: Optimize network requests and implement asset caching.'
        ],
        links:{theory:'https://web.dev/learn/performance/',practice:'https://www.webpagetest.org/',guide:'https://roadmap.sh/frontend'}
    }
};

// ─────────────────────────────────────────────────────────────
//  MODULE 2: SYNONYM + NORMALIZATION ENGINE
// ─────────────────────────────────────────────────────────────
const SYNONYM_MAP = {
    // JavaScript family
    'js':'javascript','es6':'javascript','es2015':'javascript','ecmascript':'javascript',
    'ts':'javascript','typescript':'javascript','vanilla js':'javascript','vanilla':'javascript',
    // CSS/HTML → treated as javascript (web basics)
    'html':'javascript','css':'javascript','html5':'javascript','css3':'javascript',
    'scss':'javascript','sass':'javascript','tailwind':'javascript','bootstrap':'javascript',
    // Python family
    'py':'python','python3':'python','python2':'python',
    'fastapi':'python','flask':'python','django':'python','pandas':'python',
    'numpy':'python','matplotlib':'python','scikit':'python','sklearn':'python',
    'machine learning':'python','ml':'python','deep learning':'python',
    'tensorflow':'python','pytorch':'python','ai':'python','data science':'python',
    // Java family
    'c#':'java','csharp':'java','kotlin':'java',
    'spring':'java','spring boot':'java','springboot':'java','hibernate':'java',
    // C++ family
    'c++':'cpp','cplusplus':'cpp','c plus plus':'cpp','stl':'cpp',
    // C language
    'c programming':'c','c lang':'c',
    // Core CS
    'data structures':'dsa','algo':'dsa','algorithms':'dsa','leetcode':'dsa',
    'data structures and algorithms':'dsa','competitive programming':'dsa','cp':'dsa','problem solving':'dsa',
    'oop':'oops','oops':'oops','object oriented':'oops','object oriented programming':'oops','oop concepts':'oops',
    'database':'dbms','databases':'dbms','rdbms':'dbms','mongodb':'dbms','nosql':'dbms','firebase':'dbms',
    'mysql':'sql','postgresql':'sql','postgres':'sql','sqlite':'sql','mariadb':'sql','oracle':'sql',
    'operating system':'os','operating systems':'os',
    'computer networks':'cn','networking':'cn','network':'cn','computer network':'cn',
    // React/Frontend
    'reactjs':'react','react.js':'react','react native':'react',
    'vue':'react','vuejs':'react','vue.js':'react',
    'angular':'react','angularjs':'react','next':'react','nextjs':'react','next.js':'react',
    // Node/Backend
    'nodejs':'node','node.js':'node','express':'node','express.js':'node',
    'backend':'node','rest api':'node','restful':'node',
    // Git
    'github':'git','gitlab':'git','bitbucket':'git','version control':'git','vcs':'git',
    // Docker/Cloud
    'kubernetes':'docker','k8s':'docker','aws':'docker','gcp':'docker','azure':'docker','cloud':'docker','devops':'docker',
    // SQL aliases (redundant but explicit)
    'sql server':'sql','mssql':'sql','t-sql':'sql','pl/sql':'sql',
    // Golang
    'golang':'node', // rough mapping till added to DB
};

/**
 * STEP 1: Parse raw skills string OR array into clean lowercase tokens
 */
function parseSkillsInput(input) {
    if (!input) return [];
    // Handle array already split by frontend
    if (Array.isArray(input)) {
        return input.map(s => String(s).trim().toLowerCase()).filter(s => s.length > 0);
    }
    // Handle raw string
    return String(input)
        .toLowerCase()
        .split(/[,;|\/\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

/**
 * STEP 2: Normalize each token via synonyms
 */
function normalizeSkills(rawTokens) {
    const seen = new Set();
    const result = [];
    rawTokens.forEach(token => {
        const mapped = SYNONYM_MAP[token] || token;
        if (mapped && !seen.has(mapped) && mapped.length > 0) {
            seen.add(mapped);
            result.push(mapped);
        }
    });
    return result;
}

/**
 * STEP 3: Resolve to known DB entries (returns both known + unknown)
 */
function resolveSkills(normalizedTokens) {
    const known   = normalizedTokens.filter(id => SKILL_DB[id]);
    const unknown = normalizedTokens.filter(id => !SKILL_DB[id]);
    return { known, unknown };
}

// ─────────────────────────────────────────────────────────────
//  MODULE 3: COVERAGE & DEPTH ENGINE
// ─────────────────────────────────────────────────────────────
const ALL_DOMAINS = [
    'frontend', 'backend', 'core_fundamentals', 'devops_cloud', 
    'data_science_ai', 'mobile_app_dev', 'cybersecurity', 'languages', 'tools'
];

function computeCoverage(knownIds) {
    const domainMap = {};
    ALL_DOMAINS.forEach(d => {
        domainMap[d] = { known: [], total: [] };
    });

    Object.values(SKILL_DB).forEach(s => {
        if (domainMap[s.domain]) {
            domainMap[s.domain].total.push(s.id);
        }
    });

    knownIds.forEach(id => {
        const s = SKILL_DB[id];
        if (s && domainMap[s.domain]) {
            domainMap[s.domain].known.push(id);
        }
    });

    const domainStrength = {};
    ALL_DOMAINS.forEach(d => {
        const {known, total} = domainMap[d];
        const ratio = total.length > 0 ? known.length / total.length : 0;
        domainStrength[d] = {
            known: known.length, total: total.length, ratio,
            level: ratio >= 0.7 ? 'strong' : ratio >= 0.35 ? 'developing' : ratio > 0 ? 'started' : 'absent'
        };
    });

    const domainsActive = ALL_DOMAINS.filter(d => domainStrength[d].level !== 'absent');
    const coreFundamentalsKnown = domainMap['core_fundamentals'].known.length;

    return { domainStrength, domainsActive, coreFundamentalsKnown, domainMap };
}

// ─────────────────────────────────────────────────────────────
//  MODULE 4: PROFILE CLASSIFICATION ENGINE
// ─────────────────────────────────────────────────────────────
function classifyProfile(knownIds, coverage, cgpa) {
    const { domainsActive, coreFundamentalsKnown } = coverage;
    const n = knownIds.length;
    const { summary } = analyzeCapabilities(knownIds);

    let type = 'Skill-Based Profile';
    let stage = 'developing';
    let honestDescription = summary;

    if (n === 0) {
        type = 'Uninitialized';
        stage = 'beginner';
        honestDescription = 'No verified technical capabilities detected.';
    } else if (coreFundamentalsKnown >= 4) {
        type = 'Advanced Engineering Foundations';
        stage = 'advanced';
    } else if (n > 3) {
        type = 'Multi-Capability Profile';
        stage = 'intermediate';
    }

    return { type, stage, honestDescription };
}


// ─────────────────────────────────────────────────────────────
//  MODULE 5A: ROLE DETECTION ENGINE
//  Determines primary role from skill cluster signals
// ─────────────────────────────────────────────────────────────
function analyzeCapabilities(knownIds) {
    if (knownIds.length === 0) return { active: [], parsed: 'No recognized capability set.' };
    
    const capabilities = new Set();
    knownIds.forEach(id => {
        const s = SKILL_DB[id];
        if (s && s.capabilities) s.capabilities.forEach(cap => capabilities.add(cap));
    });

    const active = Array.from(capabilities);
    return {
        active,
        parsed: active.length > 0 ? `Detected capabilities: ${active.join(', ')}.` : 'Undetermined capability set.'
    };
}







// ─────────────────────────────────────────────────────────────
//  MODULE 5B: DYNAMIC ROLE-AWARE GAP ENGINE
//  Gaps are entirely determined by role + missing clusters
// ─────────────────────────────────────────────────────────────
function addGap(gaps, id, priority, reasoning, gapType) {
    if (gaps.find(g => g.id === id)) return; // no duplicates
    const skill = SKILL_DB[id];
    if (!skill) return;
    gaps.push({ ...skill, priority, reasoning, gapType });
}

// ─────────────────────────────────────────────────────────────
//  MODULE 5B: DYNAMIC ROLE-AWARE GAP ENGINE
//  Gaps are entirely determined by role + missing clusters
// ─────────────────────────────────────────────────────────────

function detectGaps(knownIds, capabilitySummary) {
    const gaps = [];
    const active = capabilitySummary.active;

    // Reasoned Bridging Logic (V7.1 - Multi-Dimensional)
    const REASONING_ENGINE = [
        {
            ifHas: 'asynchronous execution', 
            notHas: 'logic optimization',
            id: 'dsa', priority: 'HIGH',
            reason: 'High practical fluency with async patterns detected, but theoretical problem-solving depth is missing for core screening.',
            impact: 'Significant risk of failing initial technical screening rounds at top product companies despite development skills.'
        },
        {
            ifHas: 'memory control', 
            notHas: 'application modularity',
            id: 'oops', priority: 'HIGH',
            reason: 'Precise memory management capability exists, but scalable software design (OOPS) is required for production ecosystems.',
            impact: 'Code remains restricted to system-level procedural blocks, limiting growth into architectural roles.'
        },
        {
            ifHas: 'interpreted logic', 
            notHas: 'modular design',
            id: 'oops', priority: 'MEDIUM',
            reason: 'Rapid prototyping capabilities are strong, but sustainable class-based architecture is needed for long-term projects.',
            impact: 'Code becomes unmanageable as the project scale grows due to lack of encapsulation.'
        }
    ];

    REASONING_ENGINE.forEach(bridged => {
        if (active.includes(bridged.ifHas) && !active.includes(bridged.notHas) && !knownIds.includes(bridged.id)) {
            const skill = SKILL_DB[bridged.id];
            if (skill) {
                gaps.push({ ...skill, priority: bridged.priority, reasoning: bridged.reason, impactIfIgnored: bridged.impact });
            }
        }
    });

    // Enforce 2-4 gaps for clear direction
    if (gaps.length < 2 && !knownIds.includes('dsa')) {
        const dsa = SKILL_DB['dsa'];
        gaps.push({ ...dsa, priority: 'MEDIUM', reasoning: 'Algorithmic depth is a universal requirement for technical interview parity.', impactIfIgnored: 'Limited competitiveness in the elite product market.' });
    }
    if (gaps.length < 2 && !knownIds.includes('oops')) {
        const oops = SKILL_DB['oops'];
        gaps.push({ ...oops, priority: 'MEDIUM', reasoning: 'Class-based modularity is a prerequisite for professional enterprise development.', impactIfIgnored: 'Difficulty in managing state and complexity in large-scale applications.' });
    }

    return gaps.slice(0, 4);
}









// ─────────────────────────────────────────────────────────────
//  MODULE 6: MARKET INTELLIGENCE ENGINE
// ─────────────────────────────────────────────────────────────
function generateMarketInsights(knownIds, capSummary) {
    const insights = [];
    const active = capSummary.active;

    if (active.includes('asynchronous execution')) {
        insights.push({
            segment: 'Top-Tier Product Companies (OA/Technical)',
            status: knownIds.includes('dsa') ? 'Ready' : 'Vulnerable',
            statusColor: knownIds.includes('dsa') ? '#10b981' : '#ef4444',
            insight: 'Strong practical asynchronous fluency is valuable, but current lack of algorithmic depth (DSA) creates a severe barrier for tier-1 product entities.'
        });
        insights.push({
            segment: 'Fast-Growth Startups (Dev-Heavy)',
            status: 'Competitive',
            statusColor: '#10b981',
            insight: 'Depth in Event-Loop and Promises makes you an immediate asset for shipping features. Build complex repos to prove scalability.'
        });
    }

    if (active.includes('memory control')) {
        insights.push({
            segment: 'High-Performance Engineering (HFT/Gaming)',
            status: 'Strong Alignment',
            statusColor: '#10b981',
            insight: 'Manual memory control is a niche power. Transitioning this to high-level system design (OOPS) will triple your market value.'
        });
    }

    return insights;
}



// ─────────────────────────────────────────────────────────────
//  MODULE 7: STRATEGIC INSIGHT ENGINE
// ─────────────────────────────────────────────────────────────
function generateStrategicInsight(knownIds, gaps, capabilitySummary) {
    const topGap = gaps[0];
    const skillsList = knownIds.map(id => SKILL_DB[id]?.name || id).join(', ');
    
    return {
        summary: `Profile derived from: ${skillsList}. ${topGap ? topGap.impactIfIgnored : 'Current capabilities form a cohesive technical base.'}`,
        currentFocus: `Capability Set: ${capabilitySummary.active.join(' | ').toUpperCase()}`, 
        skillDistribution: capabilitySummary.parsed,
        keyGaps: gaps.map(g => g.name).slice(0, 2).join(' & ') || 'None (Specialization Stage)',
        impact: topGap ? topGap.impactIfIgnored : 'Ready for specialized technical contribution.',
        recommendations: topGap ? `Bridge the gap between ${capabilitySummary.active[0]} and ${topGap.name} for improved architectural reach.` : 'Apply existing capabilities to production repositories.',
        nextStep: topGap ? `Master ${topGap.name} fundamentals to move beyond ${capabilitySummary.active[0]} limitations.` : 'Focus on architectural scaling.'
    };
}



// ─────────────────────────────────────────────────────────────
//  MODULE 8: ADAPTIVE ACTION PLAN GENERATOR
// ─────────────────────────────────────────────────────────────
function generateActionPlan(gaps, knownIds) {
    const plan = [];
    if (knownIds.length === 0) return [];

    const mainId = knownIds[0];
    const main = SKILL_DB[mainId];

    plan.push({
        week: 1, skill: `${main.name} Internals`, 
        goal: `Master ${main.name} execution model and internals.`, 
        execution: {
            concept: `Deep dive into ${main.capabilities.slice(0, 2).join(' & ')}.`,
            practice: `Implement 5 real-world scenarios using ${main.name}.`,
            output: `Verified core implementation snippets.`
        },
        dailyCommitment: '2h',
        resources: {
            youtube: main.youtube?.[0] || { title: 'Core Concepts', url: 'https://youtube.com' },
            reading: main.links?.theory || 'https://geeksforgeeks.org',
            practice: main.links?.practice || 'https://leetcode.com'
        },
        priority: 'HIGH'
    });

    const gap = gaps[0];
    if (gap) {
        plan.push({
            week: 2, skill: `Bridging with ${gap.name}`, 
            goal: `Solve architectural limitations via ${gap.name} basics.`, 
            execution: {
                concept: `Apply ${main.name} logic to ${gap.name} fundamentals.`,
                practice: `Solve 15+ ${gap.name} problems on LeetCode/GFG.`,
                output: `Demonstrable algorithmic fluency.`
            },
            dailyCommitment: '2h',
            resources: {
                youtube: gap.youtube?.[0] || { title: 'Gap Mastery', url: 'https://youtube.com' },
                reading: gap.links?.guide || 'https://roadmap.sh',
                practice: gap.links?.practice || 'https://leetcode.com'
            },
            priority: 'HIGH'
        });
        plan.push({
            week: 3, skill: 'Integrated Module', 
            goal: `Build a production-style component combining ${main.name} & ${gap.name}.`, 
            execution: {
                concept: `System-level integration of both layers.`,
                practice: `Build a functional tool with zero manual intervention.`,
                output: `GitHub Repository / Live Demo.`
            },
            dailyCommitment: '2.5h',
            resources: {
                youtube: { title: 'Project Guide', url: 'https://youtube.com/results?search_query=build+project+with+' + main.id },
                reading: 'https://github.com',
                practice: 'https://github.com/new'
            },
            priority: 'MEDIUM'
        });
        plan.push({
            week: 4, skill: 'Industry Readiness', 
            goal: `Optimize implementation for scale and security.`, 
            execution: {
                concept: `Code review and performance auditing.`,
                practice: `Mock technical interview on the integrated stack.`,
                output: `Optimized, tested artifact.`
            },
            dailyCommitment: '1.5h',
            resources: {
                youtube: { title: 'Interview FAQ', url: 'https://youtube.com/results?search_query=' + main.id + '+interview+questions' },
                reading: 'https://roadmap.sh',
                practice: 'https://pramp.com'
            },
            priority: 'MEDIUM'
        });
    }

    return plan;
}







// ─────────────────────────────────────────────────────────────
//  MAIN ROUTE: POST /api/analyze-advanced
// ─────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
    try {
        const { skills, cgpa = 7.0, branch = 'CSE', name = '' } = req.body;

        // ── STEP 1: Parse raw input ───────────────────────
        const rawTokens = parseSkillsInput(skills);
        console.log('\n━━━ SPA v5.0 ANALYSIS ━━━');
        console.log('INPUT received:', skills);
        console.log('PARSED tokens:', rawTokens);

        // ── STEP 2: Normalize + Resolve ───────────────────
        const normalizedTokens = normalizeSkills(rawTokens);
        const { known: knownIds, unknown: unknownTokens } = resolveSkills(normalizedTokens);
        console.log('NORMALIZED:', normalizedTokens);
        console.log('RECOGNIZED skills:', knownIds);
        console.log('UNRECOGNIZED tokens:', unknownTokens);

        // ── STEP 3: Coverage ──────────────────────────────
        const coverage = computeCoverage(knownIds);
        console.log('ACTIVE domains:', coverage.domainsActive);

        // ── STEP 3B: Analyze Capabilities ─────────────
        const capabilitySummary = analyzeCapabilities(knownIds);
        console.log('CAPABILITIES mapped:', capabilitySummary.active.length);

        // ── STEP 4: Reasoned Gap Detection ────────────
        const gaps = detectGaps(knownIds, capabilitySummary);
        
        // ── PIPELINE DEBUG LOG ──────────────────────────
        console.log({
            raw: skills,
            normalized: knownIds,
            capabilities: capabilitySummary.active,
            gaps: gaps.map(g => g.id)
        });

        // ── STEP 5: Market Logic ────────────────────────
        const marketInsights = generateMarketInsights(knownIds, capabilitySummary);

        // ── STEP 6: Strategic Reasoning ─────────────────
        const strategic = generateStrategicInsight(knownIds, gaps, capabilitySummary);

        // ── STEP 7: Dynamic Action Plan ─────────────────
        const actionPlan = generateActionPlan(gaps, knownIds);

        // ── Output Construction ────────────────────────
        const strengths = knownIds.map(id => {
            const s = SKILL_DB[id];
            return s ? { id, name:s.name, capabilities:s.capabilities } : null;
        }).filter(Boolean);

        const finalGapsArray = [
            ...gaps.filter(g => g.priority === 'HIGH').map(g => ({ ...g, resources: { youtube: g.youtube?.[0], practice: g.links?.practice, theory: g.links?.theory } })),
            ...gaps.filter(g => g.priority === 'MEDIUM').map(g => ({ ...g, resources: { youtube: g.youtube?.[0], practice: g.links?.practice, theory: g.links?.theory } }))
        ];

        return res.status(200).json({
            success: true,
            data: {
                engineVersion: "8.1.0-mentor",
                profile: {
                    ...strategic,
                    role: capabilitySummary.active.slice(0, 2).join(' + ') || 'Developing Capability'
                },
                skills: strengths,
                gaps: finalGapsArray,
                recommendations: actionPlan,
                
                // Keep backward-compatible legacy keys safely inside data for existing UI
                marketInsights,
                actionPlan,
                helpfulResources: [
                    ...knownIds.map(id => ({ name: SKILL_DB[id].name, type: 'primary', youtube: SKILL_DB[id].youtube?.[0], docs: SKILL_DB[id].links?.theory })),
                    ...gaps.map(g => ({ name: g.name, type: 'gap-bridge', youtube: g.youtube?.[0], practice: g.links?.practice }))
                ],
                executionStrategy: {
                    title: "Execution Mode: 2 Hours/Day High-Impact Split",
                    schedule: [
                        { time: "45 Mins", activity: "Theoretical Deep Dive & Documentation", mode: "Focused" },
                        { time: "60 Mins", activity: "Hands-on Implementation / Solving", mode: "Execution" },
                        { time: "15 Mins", activity: "Review & GitHub Push", mode: "Consistency" }
                    ],
                    tips: [
                        "Don't just watch videos - code as you watch.",
                        "Build at least 2 mini-projects this month.",
                        "Push daily commits to maintain GitHub heat."
                    ]
                },
                _meta: { normalized: knownIds, capabilities: capabilitySummary.active }
            }
        });



    } catch (err) {
        console.error('❌ Reasoning Engine Error:', err);
        return res.status(500).json({
            success: false,
            message: `Reasoning engine failure: ${err.message}`
        });
    }
});


module.exports = router;
