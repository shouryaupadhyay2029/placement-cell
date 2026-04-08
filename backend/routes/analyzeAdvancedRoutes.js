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
        difficulty:'Hard', difficultyScore:8, estimatedWeeks:12, dailyHours:2, demandScore:98,
        complementaryTo:['java','cpp','python','javascript'], prerequisites:[],
        whyItMatters:'DSA is the #1 filter in product-based company hiring. 90%+ of online assessments are DSA-based. Your frameworks and projects are irrelevant if you cannot clear round 1.',
        impactIfIgnored:'Profile disqualified at screening stage by most product companies.',
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
        links:{theory:'https://www.geeksforgeeks.org/data-structures/',practice:'https://leetcode.com/problemset/',guide:'https://neetcode.io/roadmap'}
    },
    oops: {
        id:'oops', name:'Object Oriented Programming',
        domain:'core_fundamentals', tier:1, weight:9,
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:3, dailyHours:1, demandScore:92,
        complementaryTo:['java','cpp','python'], prerequisites:[],
        whyItMatters:'OOP is the foundational paradigm of every major codebase. Every service and product company tests this.',
        impactIfIgnored:'Cannot write scalable code or answer system design questions at basic levels.',
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
        links:{theory:'https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/',practice:'https://www.geeksforgeeks.org/oops-interview-questions/',guide:'https://refactoring.guru/design-patterns'}
    },
    dbms: {
        id:'dbms', name:'Database Management (DBMS & SQL)',
        domain:'core_fundamentals', tier:1, weight:9,
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:4, dailyHours:1, demandScore:92,
        complementaryTo:['backend','node','java','python'], prerequisites:[],
        whyItMatters:'Every application stores data. DBMS appears in 85%+ of technical interviews across all company types.',
        impactIfIgnored:'Fail backend interviews and unable to build any data-driven application.',
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
        links:{theory:'https://www.geeksforgeeks.org/dbms/',practice:'https://leetcode.com/tag/database/',guide:'https://www.geeksforgeeks.org/sql-tutorial/'}
    },
    os: {
        id:'os', name:'Operating Systems',
        domain:'core_fundamentals', tier:1, weight:7,
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:4, dailyHours:1, demandScore:74,
        complementaryTo:['cpp','backend'], prerequisites:[],
        whyItMatters:'OS is tested in 70% of product company interviews. Understanding processes, memory, and I/O helps write better code and debug complex issues.',
        impactIfIgnored:'Struggle with system-level interview questions and backend performance debugging.',
        roadmap:{
            beginner:['Process vs Thread, Process lifecycle','CPU Scheduling — FCFS, SJF, Round Robin','Memory: Stack vs Heap, Static vs Dynamic'],
            intermediate:['Virtual Memory, Paging & Segmentation',"Deadlocks — Banker's Algorithm, Prevention",'File Systems — FAT, NTFS, inode'],
            advanced:['IPC — Pipes, Sockets, Shared Memory','Semaphores and Mutex in real code','Linux internals and system calls']
        },
        monthlyPlan:[
            'Week 1: Process states, context switching, scheduling algorithms.',
            'Week 2: Memory management — paging, page faults, TLB.',
            'Week 3: Deadlocks — conditions, prevention, and detection.',
            'Week 4: IPC mechanisms + practice Linux commands.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/operating-systems/',practice:'https://www.geeksforgeeks.org/operating-systems-interview-questions/',guide:'https://pages.cs.wisc.edu/~remzi/OSTEP/'}
    },
    cn: {
        id:'cn', name:'Computer Networks',
        domain:'core_fundamentals', tier:1, weight:6,
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:3, dailyHours:1, demandScore:68,
        complementaryTo:['backend','devops'], prerequisites:[],
        whyItMatters:'Networking underpins everything on the internet. Backend engineers need HTTP, DNS, TCP/IP for reliable distributed systems.',
        impactIfIgnored:'Cannot meaningfully work on backend systems or explain web applications in interviews.',
        roadmap:{
            beginner:['OSI Model layers and their roles','TCP vs UDP — reliability vs speed','HTTP/HTTPS — methods, status codes, headers'],
            intermediate:['DNS resolution step-by-step','IP addressing, subnetting, CIDR','Load balancers and reverse proxies'],
            advanced:['WebSockets and Server-Sent Events','CDN, caching strategies','TLS/SSL and OAuth 2.0 flows']
        },
        monthlyPlan:[
            'Week 1: OSI + TCP/IP — draw and memorize every layer.',
            'Week 2: HTTP methods, REST principles, status codes.',
            'Week 3: DNS resolution + subnetting practice.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/computer-network-tutorials/',practice:'https://www.geeksforgeeks.org/computer-networks-interview-questions/',guide:'https://roadmap.sh/system-design'}
    },
    // ── Languages ────────────────────────────────────────────
    c: {
        id:'c', name:'C Programming',
        domain:'languages', tier:2, weight:7,
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:6, dailyHours:1.5, demandScore:72,
        complementaryTo:['cpp','os','dsa'], prerequisites:[],
        whyItMatters:'C is the foundation of computer science. It teaches memory management, pointers, and systems thinking that makes you a better engineer in any language.',
        impactIfIgnored:'Miss out on embedded, systems, and firmware roles; limited understanding of how programs interact with hardware.',
        roadmap:{
            beginner:['Syntax, data types, control flow','Pointers and pointer arithmetic','Arrays, strings, functions'],
            intermediate:['Structures, unions, enums','File I/O and system calls','Dynamic memory — malloc, calloc, realloc, free'],
            advanced:['Linked lists and trees in C','Bit manipulation','Writing efficient, portable C code']
        },
        monthlyPlan:[
            'Week 1: C basics — variables, control flow, functions.',
            'Week 2: Pointers — pointer arithmetic, passing by reference.',
            'Week 3: Structs and file I/O.',
            'Week 4: Dynamic memory allocation — implement a linked list.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/c-programming-language/',practice:'https://www.hackerrank.com/domains/c',guide:'https://www.learn-c.org/'}
    },
    cpp: {
        id:'cpp', name:'C++',
        domain:'languages', tier:2, weight:8,
        difficulty:'Hard', difficultyScore:7, estimatedWeeks:8, dailyHours:1.5, demandScore:84,
        complementaryTo:['dsa','oops'], prerequisites:[],
        whyItMatters:'Industry standard for competitive programming and high-performance systems. STL mastery makes DSA faster to write and debug.',
        impactIfIgnored:'Slower in competitive programming and miss roles in finance, gaming, and system engineering.',
        roadmap:{
            beginner:['Pointers, references, memory model','Basic OOP — classes, constructors, destructors','STL containers — vector, map, set, queue'],
            intermediate:['Templates and generic programming','Move semantics, RAII','File I/O and streams'],
            advanced:['Smart pointers — unique_ptr, shared_ptr','Multithreading with std::thread','Profiling and optimization']
        },
        monthlyPlan:[
            'Week 1: Pointers, references — understand how C++ manages memory.',
            'Week 2: STL mastery — solve 15 LeetCode problems using only STL.',
            'Week 3: OOP — class hierarchy, virtual functions, destructors.',
            'Week 4: Smart pointers + write a small project (game/CLI tool).'
        ],
        links:{theory:'https://www.geeksforgeeks.org/cpp-tutorial/',practice:'https://leetcode.com/tag/cpp/',guide:'https://www.learncpp.com/'}
    },
    java: {
        id:'java', name:'Java',
        domain:'languages', tier:2, weight:9,
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:8, dailyHours:1.5, demandScore:90,
        complementaryTo:['oops','dsa','dbms','backend'], prerequisites:[],
        whyItMatters:'Java dominates enterprise and service-based company hiring — TCS, Infosys, Wipro, Cognizant all build on Java/Spring. Most hireable language in Indian campus placements.',
        impactIfIgnored:'Closed off from the largest segment of campus placement opportunities.',
        roadmap:{
            beginner:['JVM architecture, data types, OOP in Java','Collections — ArrayList, HashMap, LinkedList','Exception handling, generics'],
            intermediate:['Multithreading & concurrency','Java 8 — streams, lambdas, Optional','File I/O, serialization'],
            advanced:['Spring Boot REST API design','Hibernate & JPA','Microservices, Docker containerization']
        },
        monthlyPlan:[
            'Week 1: Java OOP — classes, inheritance, interfaces, abstract.',
            'Week 2: Collections deep dive + Java 8 streams + lambdas.',
            'Week 3: Multithreading — synchronized, wait/notify, thread pools.',
            'Week 4: Build a REST API with Spring Boot + H2/MySQL.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/java/',practice:'https://leetcode.com/tag/java/',guide:'https://roadmap.sh/java'}
    },
    python: {
        id:'python', name:'Python',
        domain:'languages', tier:2, weight:8,
        difficulty:'Easy', difficultyScore:3, estimatedWeeks:5, dailyHours:1, demandScore:88,
        complementaryTo:['dsa','ml','backend','dbms'], prerequisites:[],
        whyItMatters:'Most versatile language — AI/ML, backend APIs, scripting, and data engineering. Fastest path to building production-ready prototypes.',
        impactIfIgnored:'No access to the AI/ML ecosystem and reduced backend optionality.',
        roadmap:{
            beginner:['Syntax, lists, dicts, tuples, comprehensions','Functions, decorators, closures','File I/O, modules, packages'],
            intermediate:['OOP in Python','NumPy, Pandas — data manipulation','REST APIs with FastAPI or Flask'],
            advanced:['Async programming — asyncio, aiohttp','ML pipeline with scikit-learn','Docker + deployment']
        },
        monthlyPlan:[
            'Week 1: Core Python — data types, comprehensions, functions.',
            'Week 2: Build a CLI tool or small project.',
            'Week 3: REST API with FastAPI — auth, CRUD, database.',
            'Week 4: Pandas + data analysis on a real dataset.'
        ],
        links:{theory:'https://www.geeksforgeeks.org/python-programming-language/',practice:'https://leetcode.com/tag/python/',guide:'https://roadmap.sh/python'}
    },
    javascript: {
        id:'javascript', name:'JavaScript',
        domain:'languages', tier:2, weight:8,
        difficulty:'Medium', difficultyScore:5, estimatedWeeks:6, dailyHours:1.5, demandScore:86,
        complementaryTo:['react','node','dsa'], prerequisites:[],
        whyItMatters:'The only language that runs natively in browsers and on servers (Node.js). Backbone of the modern web stack.',
        impactIfIgnored:'Cannot build interactive frontends or JavaScript-based backends.',
        roadmap:{
            beginner:['Variables, types, functions, loops','DOM manipulation, events','Promises, async/await'],
            intermediate:['Closures, prototypes, event loop','ES6+ — destructuring, spread, modules','Fetch API, error handling'],
            advanced:['Performance optimization, memoization','TypeScript integration','Testing — Jest, Vitest']
        },
        monthlyPlan:[
            'Week 1: JS fundamentals — closures, this, prototype.',
            'Week 2: Async JS — Promises, async/await, fetch.',
            'Week 3: Build a project — weather app, todo with API.',
            'Week 4: Learn TypeScript basics + add to project.'
        ],
        links:{theory:'https://javascript.info/',practice:'https://www.frontendmentor.io/',guide:'https://roadmap.sh/javascript'}
    },
    // ── Development ──────────────────────────────────────────
    react: {
        id:'react', name:'React.js',
        domain:'frontend', tier:3, weight:7,
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:6, dailyHours:1.5, demandScore:82,
        complementaryTo:['javascript','node','dsa'], prerequisites:['javascript'],
        whyItMatters:'Dominant frontend framework. Teaches component-based thinking that applies to every other UI framework.',
        impactIfIgnored:'Frontend-focused opportunities become significantly limited without React.',
        roadmap:{
            beginner:['JSX, components, props, state','useState, useEffect hooks','Lists, conditional rendering'],
            intermediate:['useContext, useReducer, useMemo','React Router, protected routes','API fetching + loading states'],
            advanced:['State management — Redux, Zustand, Jotai','Next.js for SSR/SSG','React Query, Suspense, Code splitting']
        },
        monthlyPlan:[
            'Week 1: Build a todo app — components, props, useState.',
            'Week 2: Fetch a public API, display data with loading/error states.',
            'Week 3: React Router — multi-page navigation with protected routes.',
            'Week 4: Deploy on Vercel, add Redux or Context for global state.'
        ],
        links:{theory:'https://react.dev/learn',practice:'https://www.frontendmentor.io/challenges',guide:'https://roadmap.sh/react'}
    },
    node: {
        id:'node', name:'Node.js & Express',
        domain:'backend', tier:3, weight:7,
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:5, dailyHours:1.5, demandScore:78,
        complementaryTo:['javascript','dbms','react'], prerequisites:['javascript'],
        whyItMatters:'Unlocks server-side JavaScript — full-stack applications with one language. Critical for startups and JS-first product companies.',
        impactIfIgnored:'Remain a pure frontend developer, unable to build or understand backend systems.',
        roadmap:{
            beginner:['Node.js event loop & async model','npm, modules, package.json','Basic HTTP server with Express'],
            intermediate:['Express.js REST API — routing, middleware','JWT authentication, bcrypt','MongoDB + Mongoose integration'],
            advanced:['WebSockets for real-time features','Rate limiting, Redis caching','Docker deployment + CI/CD']
        },
        monthlyPlan:[
            'Week 1: Build a REST API with Express — GET, POST, PUT, DELETE.',
            'Week 2: Add JWT auth — register, login, protected routes.',
            'Week 3: Connect MongoDB — user model, CRUD operations.',
            'Week 4: Deploy on Render with environment variables.'
        ],
        links:{theory:'https://nodejs.dev/en/learn/',practice:'https://www.codecademy.com/learn/learn-node-js',guide:'https://roadmap.sh/nodejs'}
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
        domain:'devops', tier:4, weight:5,
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
        domain:'data', tier:2, weight:8,
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
const ALL_DOMAINS = ['core_fundamentals','languages','frontend','backend','data','tools','devops'];

function computeCoverage(knownIds) {
    const domainMap = {};
    ALL_DOMAINS.forEach(d => { domainMap[d] = { known:[], total:[] }; });
    Object.values(SKILL_DB).forEach(s => domainMap[s.domain].total.push(s.id));
    knownIds.forEach(id => {
        const s = SKILL_DB[id];
        if (s) domainMap[s.domain].known.push(id);
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
    const { domainsActive, coreFundamentalsKnown, domainStrength } = coverage;
    const n = knownIds.length;
    const hasDSA      = knownIds.includes('dsa');
    const hasOOP      = knownIds.includes('oops');
    const hasDB       = knownIds.includes('dbms') || knownIds.includes('sql');
    const hasFrontend = domainStrength['frontend'].level !== 'absent';
    const hasBackend  = domainStrength['backend'].level !== 'absent';
    const hasLang     = domainStrength['languages'].level !== 'absent';

    let type = 'Emerging Talent';
    let stage = 'beginner';
    let honestDescription = '';

    if (n === 0) {
        type = 'Fresh Start';
        stage = 'beginner';
        honestDescription = 'No recognized technical skills detected. This means you either have not started yet, or your skill names were not recognized. Please try common names like "Python", "JavaScript", "DSA", "Java", "React".';
    } else if (coreFundamentalsKnown >= 4 && n >= 6) {
        type = 'Well-Rounded Engineer';
        stage = 'advanced';
        honestDescription = `You have built a genuinely broad profile across ${domainsActive.length} domains with ${n} recognized skills. At this stage, the differentiator is depth — harder LeetCode problems, notable projects, and consistency under pressure.`;
    } else if (hasDSA && coreFundamentalsKnown >= 2 && hasLang) {
        type = 'Core CS Engineer';
        stage = 'intermediate';
        honestDescription = `Solid computer science foundation with ${n} recognized skills. DSA competence puts you ahead of most candidates. The priority now is plugging remaining CS gaps and adding practical development experience.`;
    } else if (hasFrontend && hasBackend && hasDB) {
        type = 'Full-Stack Developer';
        stage = 'intermediate';
        honestDescription = `You cover both frontend and backend layers with database knowledge — a practical, marketable profile. The critical gap is algorithmic problem-solving (DSA), which filters candidates at most product companies.`;
    } else if (hasFrontend && hasBackend && !hasDB) {
        type = 'Full-Stack Developer (No Database)';
        stage = 'intermediate';
        honestDescription = `Your frontend and backend skills are a strong combination, but the missing database layer is a significant blind spot. You cannot build any persistent, production-grade application without it.`;
    } else if (hasFrontend && !hasBackend) {
        type = 'Frontend Developer';
        stage = 'beginner';
        honestDescription = `Your profile is currently limited to the frontend layer. Frontend skills are valuable but represent only one slice of what technical interviews demand. Without backend, database, and algorithmic skills, placement opportunities will be significantly restricted.`;
    } else if (hasBackend && !hasFrontend) {
        type = 'Backend Developer';
        stage = 'intermediate';
        honestDescription = `Backend-focused profile with ${n} recognized skills. Good foundation for API and server-side roles, but DSA proficiency and core CS fundamentals will determine whether you clear product company interviews.`;
    } else if (hasLang && !hasFrontend && !hasBackend && !hasDSA) {
        type = 'Language Learner';
        stage = 'beginner';
        honestDescription = `You have started with a programming language — a necessary first step, but far from placement-ready. The gap between knowing syntax and being employable is large. You need DSA, core CS fundamentals, and applied projects urgently.`;
    } else {
        type = 'Developing Engineer';
        stage = 'beginner';
        honestDescription = `Your profile covers ${n} skill${n > 1 ? 's' : ''} across ${domainsActive.length} domain${domainsActive.length > 1 ? 's' : ''}. There are critical gaps that will directly affect your placement readiness. The analysis below identifies exactly what to address.`;
    }

    return { type, stage, honestDescription };
}

// ─────────────────────────────────────────────────────────────
//  MODULE 5: GAP DETECTION ENGINE (CONTEXT-AWARE)
// ─────────────────────────────────────────────────────────────
const CRITICAL_FUNDAMENTALS = ['dsa', 'oops', 'dbms', 'os'];

function detectGaps(knownIds, profile, coverage) {
    const gaps = [];
    const { stage } = profile;
    const hasDSA    = knownIds.includes('dsa');
    const hasJS     = knownIds.includes('javascript');
    const hasPython = knownIds.includes('python');
    const hasC      = knownIds.includes('c') || knownIds.includes('cpp') || knownIds.includes('java');
    const hasBackend = knownIds.includes('node') || knownIds.includes('java') || knownIds.includes('python');
    const hasSQL    = knownIds.includes('sql') || knownIds.includes('dbms');
    const hasFront  = knownIds.includes('react') || knownIds.includes('javascript');
    const hasGit    = knownIds.includes('git');

    // ─ CRITICAL: Missing Fundamentals ─
    CRITICAL_FUNDAMENTALS.forEach(id => {
        if (knownIds.includes(id)) return;
        const skill = SKILL_DB[id];

        let contextReason = skill.whyItMatters;

        // Personalized reasoning based on what they DO have
        if (id === 'dsa') {
            if (hasJS || hasFront) {
                contextReason = `You have web development skills, but without DSA you will fail the online assessment stage at every product company (Microsoft, Amazon, Google, Flipkart, funded startups). These assessments are DSA-only — your React knowledge will not help you there.`;
            } else if (hasPython) {
                contextReason = `Python is a great language, but DSA is tested independently of language. Knowing Python syntax without DSA means you cannot solve the algorithmic problems that every hiring filter is based on.`;
            } else if (hasC) {
                contextReason = `You know a systems language, which is a good start. Now apply that language knowledge to solve algorithmic problems systematically — that's what DSA transforms your profile into.`;
            }
        }
        if (id === 'dbms') {
            if (hasJS || hasBackend) {
                contextReason = `You are building applications, but every real application persists data. Not knowing DBMS means you cannot design schemas, write queries, or answer the data-related questions that appear in 85% of technical interviews.`;
            }
        }
        if (id === 'oops') {
            if (hasJS) {
                contextReason = `JavaScript uses OOP concepts (prototypal inheritance, classes) internally. You are using it without understanding the foundation. OOP design is directly tested in every service-based company interview.`;
            } else if (hasPython) {
                contextReason = `Python supports full OOP. Not studying it formally means you are missing the design principles that make code maintainable and interviews passable.`;
            }
        }

        gaps.push({ ...skill, priority:'CRITICAL', reasoning: contextReason, gapType:'missing_fundamental' });
    });

    // ─ HIGH: Complementary Skill Gaps ─
    if ((hasJS || hasFront) && !knownIds.includes('node') && !hasBackend) {
        gaps.push({
            ...SKILL_DB['node'], priority:'HIGH',
            reasoning: `You know JavaScript/frontend but cannot build APIs or connect to databases. This limits you to purely UI roles. Node.js is the natural next step given your JS background and will unlock full-stack positions, which are far more abundant.`,
            gapType:'missing_complement'
        });
    }

    if (hasPython && !hasSQL) {
        gaps.push({
            ...SKILL_DB['sql'], priority:'HIGH',
            reasoning: `Python without SQL means you cannot persist or query data — core to data engineering, data science, and backend development. SQL is the universal companion to Python in almost every data-adjacent role.`,
            gapType:'missing_complement'
        });
    }

    if ((hasBackend || hasFront) && !hasSQL && !knownIds.includes('dbms')) {
        if (!gaps.find(g => g.id === 'sql')) {
            gaps.push({
                ...SKILL_DB['sql'], priority:'HIGH',
                reasoning: `You are building applications but have no database layer. SQL is required to store, retrieve, and manipulate data — without it you are fundamentally limited in what you can build or discuss in an interview.`,
                gapType:'missing_complement'
            });
        }
    }

    // ─ HIGH: Git (non-negotiable tool) ─
    if (!hasGit && knownIds.length > 0) {
        gaps.push({
            ...SKILL_DB['git'], priority:'HIGH',
            reasoning: `Git is a professional baseline — not optional. Without it you cannot work in a team, cannot showcase code, and your GitHub profile (which recruiters check) remains empty. This is the highest return-on-time investment for your profile right now.`,
            gapType:'missing_tool'
        });
    }

    // ─ MEDIUM: High-value additions (only if not already overloaded with CRITICAL) ─
    const criticalCount = gaps.filter(g => g.priority === 'CRITICAL').length;
    if (criticalCount <= 3) {
        ['python','java','react','cn'].forEach(id => {
            if (knownIds.includes(id)) return;
            if (gaps.find(g => g.id === id)) return;
            const skill = SKILL_DB[id];
            if (!skill) return;
            gaps.push({
                ...skill, priority:'MEDIUM',
                reasoning: `${skill.name} has a ${skill.demandScore}% industry demand score. Adding it significantly increases the number of roles and companies you qualify for.`,
                gapType:'high_value_addition'
            });
        });
    }

    // Sort: CRITICAL → HIGH → MEDIUM → by demand score desc
    const order = { CRITICAL:0, HIGH:1, MEDIUM:2 };
    gaps.sort((a, b) => {
        const pd = (order[a.priority]||3) - (order[b.priority]||3);
        return pd !== 0 ? pd : b.demandScore - a.demandScore;
    });

    return gaps.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────
//  MODULE 6: MARKET INTELLIGENCE ENGINE
// ─────────────────────────────────────────────────────────────
function generateMarketInsights(knownIds, profile, cgpa) {
    const hasDSA    = knownIds.includes('dsa');
    const hasJava   = knownIds.includes('java');
    const hasBackend = knownIds.includes('node') || knownIds.includes('java') || knownIds.includes('python');
    const hasSQL    = knownIds.includes('sql') || knownIds.includes('dbms');
    const hasReact   = knownIds.includes('react') || knownIds.includes('javascript');
    const insights  = [];

    // ─ Product Companies ─
    insights.push({
        segment: 'Product Companies (Google, Microsoft, Amazon, Flipkart, Startups)',
        status:  hasDSA ? 'Conditionally Ready' : 'Not Ready',
        statusColor: hasDSA ? '#f59e0b' : '#ef4444',
        insight: hasDSA
            ? `You have DSA — the primary filter for product company OAs. Next focus: consistency at Medium difficulty on LeetCode (target 100+ problems) and system design fundamentals for advanced rounds.`
            : `Without DSA, your profile does not pass the online assessment stage at product companies. This is a binary filter — all other skills become irrelevant until this is addressed.`
    });

    // ─ Service Companies ─
    if (hasBackend && hasSQL) {
        insights.push({
            segment: 'Service Companies (TCS, Infosys, Wipro, Accenture, Cognizant)',
            status: 'Ready',
            statusColor: '#10b981',
            insight: 'Your backend and SQL skills align with service company requirements. Focus on Java (if not already known), communication, and logical reasoning for aptitude rounds. Most service companies have CGPA cutoffs between 6.0–7.5.'
        });
    } else {
        insights.push({
            segment: 'Service Companies (TCS, Infosys, Wipro, Accenture, Cognizant)',
            status: 'Partially Ready',
            statusColor: '#f59e0b',
            insight: `Service companies test Java (or any OOP language) and SQL as core expectations. Your current profile needs ${!hasBackend ? 'backend development and ' : ''}${!hasSQL ? 'SQL/database knowledge ' : ''}to qualify more strongly for their technical rounds.`
        });
    }

    // ─ Startups ─
    if (hasReact || hasBackend) {
        insights.push({
            segment: 'Startups & Mid-Stage Companies',
            status: hasDSA ? 'Strong Fit' : 'Good Fit',
            statusColor: hasDSA ? '#10b981' : '#f59e0b',
            insight: `Startups value practical skills and shipping velocity. Your ${hasReact ? 'frontend' : ''}${hasReact && hasBackend ? ' + ' : ''}${hasBackend ? 'backend' : ''} skills are relevant. Ensure you have at least one deployed project. Basic DSA is still expected for technical screens.`
        });
    } else {
        insights.push({
            segment: 'Startups & Mid-Stage Companies',
            status: 'Limited Access',
            statusColor: '#ef4444',
            insight: 'Without practical development skills (React, Node, Python backend), startup opportunities are limited. Startups hire for immediate productivity — build something deployable first.'
        });
    }

    // ─ CGPA Context ─
    const cgpaFloat = parseFloat(cgpa) || 0;
    if (cgpaFloat < 7.0) {
        insights.push({
            segment: 'CGPA Gating Risk',
            status: 'Risk Flag',
            statusColor: '#ef4444',
            insight: `A CGPA below 7.0 blocks shortlisting at many companies (Microsoft, Amazon, and most product companies require 7.0+). This cannot be changed, so maximizing skill quality and project depth becomes non-negotiable for your profile to stand out.`
        });
    } else if (cgpaFloat >= 8.0) {
        insights.push({
            segment: 'CGPA Advantage',
            status: 'Strong',
            statusColor: '#10b981',
            insight: `Your CGPA clears the threshold for most company shortlisting criteria. The competition from here is decided entirely by technical skills and interview performance.`
        });
    }

    return insights;
}

// ─────────────────────────────────────────────────────────────
//  MODULE 7: STRATEGIC INSIGHT ENGINE
// ─────────────────────────────────────────────────────────────
function generateStrategicInsight(knownIds, profile, gaps, coverage) {
    const { type, honestDescription } = profile;
    const topGap = gaps[0];
    const criticalCount = gaps.filter(g => g.priority === 'CRITICAL').length;

    let immediateAction = '';
    if (topGap) {
        immediateAction = `Start with ${topGap.name} today. Commit ${topGap.dailyHours}h per day — ${topGap.estimatedWeeks} weeks of focused effort will bring you to interview-ready level. Impact if you delay: ${topGap.impactIfIgnored}`;
    } else if (knownIds.length > 0) {
        immediateAction = 'Your skill coverage is solid. Focus on deepening problem-solving with harder LeetCode problems and building a portfolio project that demonstrates your strongest skill.';
    } else {
        immediateAction = 'Start by choosing one programming language (Python or JavaScript are best for beginners) and commit to 30 days of daily practice before adding anything else.';
    }

    const { domainsActive, coreFundamentalsKnown } = coverage;
    let depthAnalysis = '';
    if (knownIds.length === 0) {
        depthAnalysis = 'No skills detected. Please enter your skills separated by commas (e.g., "Python, JavaScript, React").';
    } else if (domainsActive.length === 1) {
        depthAnalysis = `Your skills are concentrated in one domain (${domainsActive[0].replace('_',' ')}). Placement interviews test a broader set — especially core CS fundamentals that are currently absent.`;
    } else if (criticalCount >= 3) {
        depthAnalysis = `Despite having ${knownIds.length} skill${knownIds.length > 1 ? 's' : ''}, there are ${criticalCount} critical fundamental gaps that will block you in technical interviews. Address them in order of priority.`;
    } else if (domainsActive.length >= 4) {
        depthAnalysis = `Good breadth across ${domainsActive.length} domains. The next goal is depth — become notably strong in 2 areas rather than superficially covering many.`;
    } else {
        depthAnalysis = `You cover ${domainsActive.length} domain${domainsActive.length > 1 ? 's' : ''} with ${knownIds.length} skill${knownIds.length > 1 ? 's' : ''}. ${criticalCount > 0 ? `Addressing the ${criticalCount} critical gap${criticalCount > 1 ? 's' : ''} identified is the highest priority.` : 'Continue building depth in your strongest areas.'}`;
    }

    return { honestDescription, immediateAction, depthAnalysis };
}

// ─────────────────────────────────────────────────────────────
//  MODULE 8: ADAPTIVE ACTION PLAN GENERATOR
// ─────────────────────────────────────────────────────────────
function generateActionPlan(gaps, profile, knownIds) {
    const plan = [];
    const topGaps = gaps.filter(g => g.priority === 'CRITICAL' || g.priority === 'HIGH').slice(0, 3);

    if (topGaps.length === 0 && knownIds.length === 0) {
        return [{
            week:1, skill:'Choose Your First Language',
            goal:'Install Python or JavaScript. Complete a "Hello World" and 5 basic programs.',
            dailyCommitment:'1h/day', milestone:'Comfortable with basic syntax and loops',
            practiceLink:'https://www.geeksforgeeks.org/python-programming-language/', priority:'HIGH'
        }];
    }

    topGaps.forEach((gap, idx) => {
        plan.push({
            week: idx + 1,
            skill: gap.name,
            goal: gap.monthlyPlan ? gap.monthlyPlan[0] : `Begin ${gap.name} fundamentals systematically.`,
            dailyCommitment: `${gap.dailyHours}h/day`,
            milestone: gap.roadmap?.beginner?.[0] || `Complete beginner phase of ${gap.name}`,
            practiceLink: gap.links?.practice || 'https://leetcode.com',
            priority: gap.priority
        });
    });

    // Always add a project-building week
    plan.push({
        week: topGaps.length + 1,
        skill: 'Project Integration',
        goal: 'Build one end-to-end project using your strongest skills. Deploy it publicly. A deployed project is more credible than 10 certificates.',
        dailyCommitment: '2h/day',
        milestone: 'One live deployed project with GitHub link',
        practiceLink: 'https://github.com',
        priority: 'HIGH'
    });

    // Always add an interview-prep week
    plan.push({
        week: topGaps.length + 2,
        skill: 'Interview Preparation',
        goal: 'Solve 3 LeetCode Easy/Medium problems per day. Review core CS interview questions for your target companies.',
        dailyCommitment: '1.5h/day',
        milestone: '50 LeetCode problems solved + core CS revision complete',
        practiceLink: 'https://leetcode.com/problemset/',
        priority: 'HIGH'
    });

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
        console.log('\n━━━ SPA v4.1 ANALYSIS ━━━');
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

        // ── STEP 4: Profile ───────────────────────────────
        const profile  = classifyProfile(knownIds, coverage, parseFloat(cgpa));
        console.log('PROFILE type:', profile.type, '| stage:', profile.stage);

        // ── STEP 5: Gap Detection ─────────────────────────
        const gaps     = detectGaps(knownIds, profile, coverage);
        console.log('GAPS detected:', gaps.length, '→', gaps.map(g => `${g.id}(${g.priority})`).join(', '));

        // ── STEP 6: Market Intelligence ───────────────────
        const marketInsights = generateMarketInsights(knownIds, profile, cgpa);
        console.log('MARKET insights generated:', marketInsights.length);

        // ── STEP 7: Strategic Insight ─────────────────────
        const strategic = generateStrategicInsight(knownIds, profile, gaps, coverage);

        // ── STEP 8: Action Plan ───────────────────────────
        const actionPlan = generateActionPlan(gaps, profile, knownIds);
        console.log('ACTION PLAN weeks:', actionPlan.length);
        console.log('━━━ END ANALYSIS ━━━\n');

        // ── Build output ──────────────────────────────────
        const strengths = knownIds.map(id => {
            const s = SKILL_DB[id];
            return s ? { id, name:s.name, category:s.domain, demandScore:s.demandScore, tier:s.tier } : null;
        }).filter(Boolean);

        const criticalGaps = gaps.filter(g => g.priority === 'CRITICAL');
        const highGaps     = gaps.filter(g => g.priority === 'HIGH');
        const mediumGaps   = gaps.filter(g => g.priority === 'MEDIUM');

        return res.status(200).json({
            success: true,
            profileType: profile.type,
            stage:       profile.stage,
            strategic,
            strengths,
            gaps: {
                critical: criticalGaps,
                high:     highGaps,
                medium:   mediumGaps,
                total:    gaps.length
            },
            marketInsights,
            actionPlan,
            // Full pipeline trace for frontend display
            _meta: {
                rawInput:         Array.isArray(skills) ? skills : [skills],
                parsedTokens:     rawTokens,
                normalizedTokens,
                recognizedSkills: knownIds,
                unrecognizedTokens: unknownTokens,
                branch, cgpa: parseFloat(cgpa)
            }
        });

    } catch (err) {
        console.error('❌ SPA Intelligence Engine Error:', err);
        return res.status(500).json({
            success: false,
            message: `Intelligence engine error: ${err.message}. Please check server logs.`
        });
    }
});

module.exports = router;
