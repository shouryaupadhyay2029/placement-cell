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
        difficulty:'Medium', difficultyScore:6, estimatedWeeks:4, dailyHours:1, demandScore:74,
        complementaryTo:['cpp','backend'], prerequisites:[],
        whyItMatters:'OS is tested in 70% of product company interviews. Understanding processes, memory, and I/O helps write better code and debug complex issues.',
        impactIfIgnored:'Struggle with system-level interview questions and backend performance debugging.',
        youtube:[
            {title:'Operating Systems – Neso Academy',url:'https://www.youtube.com/watch?v=vBURTt97EkA'},
            {title:'OS Concepts for Interviews – Gate Smashers',url:'https://www.youtube.com/watch?v=bkSWJJZNgf8'}
        ],
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
    const { domainsActive, coreFundamentalsKnown, domainStrength, domainMap } = coverage;
    const n = knownIds.length;
    const hasDSA      = knownIds.includes('dsa');
    const hasFront    = domainStrength['frontend'].level !== 'absent';
    const hasBack     = domainStrength['backend'].level !== 'absent';
    const coreFundamentals = coverage.domainMap['core_fundamentals'] || { known: [] };
    const hasDB       = coreFundamentals.known.includes('dbms') || coreFundamentals.known.includes('sql');

    let type = 'Developing Engineer';
    let stage = 'beginner';
    let honestDescription = '';

    if (n === 0) {
        type = 'Unclassified';
        stage = 'beginner';
        honestDescription = 'No recognized technical tokens detected. Reset input using standard naming conventions (e.g., Python, React, DSA).';
    } else if (coreFundamentalsKnown >= 4 && n >= 6) {
        type = 'Advanced Core Engineer';
        stage = 'advanced';
        honestDescription = `Broad coverage across ${domainsActive.length} domains. Current focus should shift to system-level depth and competitive problem-solving.`;
    } else if (hasDSA && coreFundamentalsKnown >= 2) {
        type = 'Core Backend Candidate';
        stage = 'intermediate';
        honestDescription = `Strong fundamental base. Missing practical application frameworks to translate core knowledge into shipable products.`;
    } else if (hasFront && hasBack && hasDB) {
        type = 'Full-Stack Developer';
        stage = 'intermediate';
        honestDescription = `Practical profile optimized for development roles. Competitive screening (DSA) remains the primary risk for product companies.`;
    } else if (hasFront && !hasBack) {
        type = 'Frontend Specialization';
        stage = 'beginner';
        honestDescription = `Single-domain concentration. High risk for generalist technical interviews. Requires backend and fundamental core expansion.`;
    } else {
        type = 'Developing Engineer';
        stage = 'beginner';
        honestDescription = `Profile shows early-stage baseline with ${n} recognized skills. Significant fundamental expansion is required for industry alignment.`;
    }

    return { type, stage, honestDescription };
}

// ─────────────────────────────────────────────────────────────
//  MODULE 5A: ROLE DETECTION ENGINE
//  Determines primary role from skill cluster signals
// ─────────────────────────────────────────────────────────────
const ROLE_CLUSTERS = {
    frontend:  ['javascript','react'],
    backend:   ['node','java','python'],
    data:      ['python','sql','dbms'],
    systems:   ['c','cpp','os'],
    core:      ['dsa','oops','dbms','os','cn']
};

function detectRole(knownIds) {
    if (knownIds.length === 0) return 'beginner';

    const scores = {};
    Object.entries(ROLE_CLUSTERS).forEach(([role, skills]) => {
        scores[role] = skills.filter(s => knownIds.includes(s)).length;
    });

    const hasDSA      = knownIds.includes('dsa');
    const hasFront    = scores.frontend > 0;
    const hasBack     = scores.backend  > 0;
    const hasData     = scores.data     > 0;
    const hasSystems  = scores.systems  > 0;

    if (hasFront && hasBack)   return 'fullstack';
    if (hasFront && !hasBack)  return 'frontend';
    if (hasBack  && !hasFront) return 'backend';
    if (hasData  && !hasFront) return 'data';
    if (hasSystems || hasDSA)  return 'core';
    return 'beginner';
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

function detectGaps(knownIds, profile, coverage, role) {
    const gaps  = [];
    const has   = id => knownIds.includes(id);
    const hasAny = ids => ids.some(id => knownIds.includes(id));

    const hasDSA     = has('dsa');
    const hasOOP     = has('oops');
    const hasDBMS    = has('dbms') || has('sql');
    const hasOS      = has('os');
    const hasGit     = has('git');
    const hasJS      = has('javascript');
    const hasPython  = has('python');
    const hasJava    = has('java');
    const hasCpp     = has('cpp') || has('c');
    const hasFront   = hasAny(['react','javascript']);
    const hasBack    = hasAny(['node','java','python']);
    const hasNode    = has('node');
    const hasReact   = has('react');

    // ─────────────────────────────────────────────────────
    //  ROLE: FRONTEND (JS/React without backend)
    // ─────────────────────────────────────────────────────
    if (role === 'frontend') {
        addGap(gaps,'node','CRITICAL',
            'Frontend specialisation without server-side knowledge. Node.js is the standard expansion for becoming full-stack marketable.',
            'role_complement');
        if (!hasDSA) addGap(gaps,'dsa','CRITICAL',
            'Critical algorithmic gap. High rejection risk for product-based technical screens.',
            'universal_requirement');
        if (!hasDBMS) addGap(gaps,'sql','HIGH',
            'Missing data persistence foundation. Required for any non-UI specific placement.',
            'role_complement');
        if (!hasOOP) addGap(gaps,'oops','HIGH',
            'Weak structural design foundations. Required for architecture-focused technical rounds.',
            'foundation_gap');
        if (!hasGit) addGap(gaps,'git','HIGH',
            'No version control evidence. Mandatory for team-based industrial environments.',
            'tool_gap');
    }

    else if (role === 'backend') {
        if (!hasDSA) addGap(gaps,'dsa','CRITICAL',
            'Backend profile currently lacks algorithmic screening capability. Mandatory for initial shortlisting.',
            'universal_requirement');
        if (!hasDBMS) addGap(gaps,'dbms','CRITICAL',
            'Server-side focus without database layer knowledge. Non-viable for backend placements.',
            'critical_foundation');
        if (!hasOOP) addGap(gaps,'oops','HIGH',
            'Missing object-oriented design patterns necessary for scalable backend architecture.',
            'foundation_gap');
    }

    else if (role === 'data') {
        if (!hasDSA) addGap(gaps,'dsa','CRITICAL',
            'Analytics companies use DSA as a primary candidate filter. Currently unpassable.',
            'universal_requirement');
        if (!hasBack) addGap(gaps,'node','HIGH',
            'Ability to expose models via APIs is missing. Limits role to pure analytics instead of ML engineering.',
            'role_complement');
    }

    else if (role === 'fullstack') {
        if (!hasDSA) addGap(gaps,'dsa','CRITICAL',
            'Practical dev skills are strong, but the candidate fails the algorithmic filter for product companies.',
            'universal_requirement');
        if (!hasDBMS) addGap(gaps,'dbms','CRITICAL',
            'Full-stack profile with a missing data persistency layer. Critical structural gap.',
            'critical_foundation');
    }

    else if (role === 'core') {
        if (!hasDSA) addGap(gaps,'dsa','CRITICAL',
            'Language knowledge exists without application to structured problem-solving.',
            'critical_foundation');
        if (!hasFront && !hasBack) addGap(gaps,'node','HIGH',
            'Theoretical profile lacks demonstrable output skill. Recommend adding Node.js backend.',
            'role_complement');
    }

    else {
        if (!hasDSA) addGap(gaps,'dsa','CRITICAL', 'Mandatory for placement eligibility at product companies.', 'universal_requirement');
        if (!hasJS && !hasPython && !hasJava) addGap(gaps,'python','HIGH', 'Primary language fluency required before framework expansion.', 'foundation');
        if (!hasDBMS) addGap(gaps,'dbms','HIGH', 'State persistence is a baseline requirement for all software roles.', 'foundation_gap');
    }

    // ─────────────────────────────────────────────────────
    //  UNIVERSAL: OS for all non-beginner roles
    // ─────────────────────────────────────────────────────
    if (!hasOS && role !== 'beginner' && role !== 'frontend' && gaps.length < 6) {
        addGap(gaps,'os','MEDIUM',
            `Operating systems concepts appear in 70% of product company interviews. Process management, memory, and concurrency are regularly tested in backend and systems design rounds.`,
            'universal_depth');
    }

    // Sort: CRITICAL → HIGH → MEDIUM → demandScore desc
    const order = { CRITICAL:0, HIGH:1, MEDIUM:2 };
    gaps.sort((a, b) => {
        const pd = (order[a.priority]||3) - (order[b.priority]||3);
        return pd !== 0 ? pd : (b.demandScore||0) - (a.demandScore||0);
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
function generateStrategicInsight(knownIds, profile, gaps, coverage, role) {
    const { honestDescription } = profile;
    const topGap = gaps[0];
    const criticalCount = gaps.filter(g => g.priority === 'CRITICAL').length;
    const { domainStrength, domainsActive } = coverage;

    // Build Distribution String
    const distribution = domainsActive.map(d => {
        const label = d.replace('_',' ').toUpperCase();
        const level = domainStrength[d].level;
        const levelLabel = level === 'strong' ? 'Strong' : level === 'developing' ? 'Developing' : 'Limited';
        return `${label}: ${levelLabel}`;
    }).join('\n');

    const roleSummary = {
        frontend:  'Concentrated Frontend specialization.',
        backend:   'Mandatory Backend focus.',
        fullstack: 'Balanced Full-stack profile.',
        data:      'Data-centric analysis profile.',
        core:      'Systems/Core CS orientation.',
        beginner:  'Early-stage technical profile.'
    };

    const nextStep = topGap ? `Initiate ${topGap.name} training immediately to clear product OAs.` : 'Deepen existing skills through deployment and complex problem-solving.';

    return {
        summary:           roleSummary[role] || roleSummary.beginner,
        currentFocus:      honestDescription || 'Baseline skill acquisition and fundamental core development.',
        skillDistribution: distribution || 'DISTRIBUTION: UNAVAILABLE',
        keyGaps:           gaps.slice(0, 3).map(g => g.name).join(', ') || 'None identified (Refine input)',
        impact:            topGap ? topGap.impactIfIgnored : 'Baseline readiness maintained. Competitive disadvantage remains for product roles.',
        recommendations:   gaps.slice(0, 2).map(g => g.reasoning).join(' ') || 'Concentrate on Data Structures and one primary programming language.',
        nextStep:          nextStep || 'Initiate fundamental Data Structures (DSA) learning path.'
    };
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

        // ── STEP 3B: Detect Role ─────────────────────────
        const role = detectRole(knownIds);
        console.log('DETECTED ROLE:', role);

        // ── STEP 4: Profile ───────────────────────────────
        const profile  = classifyProfile(knownIds, coverage, parseFloat(cgpa));
        console.log('PROFILE type:', profile.type, '| stage:', profile.stage);

        // ── STEP 5: Role-Aware Gap Detection ─────────────
        const gaps = detectGaps(knownIds, profile, coverage, role);
        console.log('GAPS detected:', gaps.length, '→', gaps.map(g => `${g.id}(${g.priority})`).join(', '));

        // ── STEP 6: Market Intelligence ───────────────────
        const marketInsights = generateMarketInsights(knownIds, profile, cgpa);
        console.log('MARKET insights generated:', marketInsights.length);

        // ── STEP 7: Strategic Insight ─────────────────────
        const strategic = generateStrategicInsight(knownIds, profile, gaps, coverage, role);

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
            engineVersion: "5.1.0-structured",
            profileType: profile.type,
            stage:       profile.stage,
            role,
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
