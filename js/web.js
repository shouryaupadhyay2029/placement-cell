// Initialization context
if (!localStorage.getItem("college")) {
    console.log("Setting default college context to USAR");
    localStorage.setItem("college", "USAR");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initSemiSidebar();
    });
} else {
    initSemiSidebar();
}

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        // Add a small delay for premium feel
        setTimeout(() => {
            loader.classList.add("hidden");
        }, 800);
    }
});

// semicircle sidebar positioning
function initSemiSidebar() {
    const items = document.querySelectorAll('.semi-item');
    const sections = document.querySelectorAll('.section');
    const semiSidebar = document.querySelector('.semi-sidebar');

    if (items.length === 0 || !semiSidebar) return;

    // College Selector Logic
    const collegeTrigger = document.getElementById('collegeSelectorTrigger');
    const collegePanel = document.getElementById('collegeSelectorPanel');
    const collegeOptions = document.querySelectorAll('.college-option');
    const navCollegeDisplay = document.getElementById('navCollegeDisplay');
    const contextOverlay = document.getElementById('contextOverlay');
    const mainContent = document.querySelector('.main-content');

    if (collegeTrigger && collegePanel) {
        let panelTimeout;

        collegeTrigger.addEventListener('mouseenter', () => {
            clearTimeout(panelTimeout);
            collegePanel.classList.add('show');
        });

        collegeTrigger.addEventListener('mouseleave', () => {
            panelTimeout = setTimeout(() => {
                if (!collegePanel.matches(':hover')) {
                    collegePanel.classList.remove('show');
                }
            }, 300);
        });

        collegePanel.addEventListener('mouseleave', () => {
            panelTimeout = setTimeout(() => {
                if (!collegeTrigger.matches(':hover')) {
                    collegePanel.classList.remove('show');
                }
            }, 300);
        });

        collegePanel.addEventListener('mouseenter', () => {
            clearTimeout(panelTimeout);
        });

        collegeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedCollege = opt.getAttribute('data-college');
                const currentCollege = localStorage.getItem('college') || 'USAR';

                if (selectedCollege === currentCollege) return;

                // Update active selection visually
                collegeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');

                // Perform smooth transition
                if (contextOverlay && mainContent) {
                    contextOverlay.innerHTML = `<div class="switching-indicator">Switching to ${selectedCollege}...</div>`;
                    
                    contextOverlay.classList.add('visible');
                    mainContent.classList.add('context-switching');

                    // Animate Navbar Display
                    if (navCollegeDisplay) navCollegeDisplay.classList.add('switching');

                    setTimeout(async () => {
                        // 1. CLEAR STALE STATE
                        localStorage.setItem('college', selectedCollege);
                        localStorage.removeItem('selectedBatchYear');
                        localStorage.removeItem('cachedStats'); // Clear any cache
                        localStorage.removeItem('cachedCompanies');

                        if (navCollegeDisplay) {
                            updateContextIndicator(selectedCollege, localStorage.getItem('selectedBatchYear'));
                            navCollegeDisplay.classList.remove('switching');
                        }

                        // 2. RE-INITIALIZE UI CONTEXT
                        document.body.setAttribute('data-college-context', selectedCollege);
                        
                        // Update Context Header
                        updateContextIndicator(selectedCollege, localStorage.getItem('selectedBatchYear'));

                        try {
                            // 3. FETCH BATCHES for specific college (Injectively handled via api.js)
                            const bRes = await window.api.get(`/companies/batches`);
                            const batches = bRes.ok ? await bRes.json() : [];
                            
                            // Dynamically update dropdowns and tabs
                            updateBatchUI(batches, selectedCollege);

                             // 5. TRIGGER DATA REFRESH
                             const finalYear = batches.length > 0 ? batches[0] : "all";
                             localStorage.setItem("selectedBatchYear", finalYear);
                             await triggerPageRefresh(finalYear);

                        } catch (e) { 
                            console.error("Batch synchronization error:", e); 
                        }

                        setTimeout(() => {
                            contextOverlay.classList.remove('visible');
                            mainContent.classList.remove('context-switching');
                            setTimeout(() => { contextOverlay.innerHTML = ''; }, 300);
                        }, 400);
                    }, 600);
                } else {
                    localStorage.setItem('college', selectedCollege);
                    if (navCollegeDisplay) updateContextIndicator(selectedCollege, localStorage.getItem('selectedBatchYear'));
                }
                collegePanel.classList.remove('show');
            });
        });

        // Initialize from Persistence (localStorage)
        const storedCollege = localStorage.getItem('college') || 'USAR';
        if (navCollegeDisplay) updateContextIndicator(storedCollege, localStorage.getItem('selectedBatchYear'));
        document.body.setAttribute('data-college-context', storedCollege);
        
        collegeOptions.forEach(o => {
            o.classList.toggle('active', o.getAttribute('data-college') === storedCollege);
        });
    }

    // Click logic
    items.forEach((it) => {
        it.addEventListener('click', e => {
            if (it === collegeTrigger) {
                e.preventDefault();
                return;
            }
            const nav = it.getAttribute('data-nav');
            const id = it.getAttribute('data-section');

            // 1. PHYSICAL PAGE NAVIGATION
            if (nav) {
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = nav;
                }, 300);
                return;
            }

            // 2. SAME-PAGE SECTION SWITCHING
            items.forEach(i => i.classList.remove('active'));
            it.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));

            const target = document.getElementById(id);
            if (target) target.classList.add('active');
        });
    });

    // Auto-activate sidebar item based on current page URL
    const currentPath = window.location.pathname;
    items.forEach(it => {
        const nav = it.getAttribute('data-nav');
        if (nav && currentPath.includes(nav)) {
            items.forEach(i => i.classList.remove('active'));
            it.classList.add('active');
        }
    });

    // Proximity Reveal Logic
    let hideTimeout;
    const revealRadius = 180; // semicircular trigger distance in px

    let isThrottled = false;
    document.addEventListener('mousemove', (e) => {
        if (isThrottled) return;
        isThrottled = true;
        requestAnimationFrame(() => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Get sidebar rect center
            const rect = semiSidebar.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const distanceToCenterY = Math.abs(mouseY - centerY);

            // Calculate semicircular physical distance from (0, centerY)
            const distanceToCenter = Math.sqrt(mouseX * mouseX + distanceToCenterY * distanceToCenterY);

            // Reveal if inside the semicircle radius or directly hovering the navigation items
            if (distanceToCenter < revealRadius || semiSidebar.matches(':hover') || (collegePanel && collegePanel.matches(':hover'))) {
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
                semiSidebar.classList.add('visible');
                document.body.classList.add('sidebar-open');
            } else {
                // Delay disappearing safely without overlapping timer issues
                if (!hideTimeout && semiSidebar.classList.contains('visible')) {
                    hideTimeout = setTimeout(() => {
                        if (collegePanel && collegePanel.classList.contains('show')) return;
                        semiSidebar.classList.remove('visible');
                        document.body.classList.remove('sidebar-open');
                        hideTimeout = null;
                    }, 500);
                }
            }
            isThrottled = false;
        });
    });

    // Hover Persistence
    semiSidebar.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        hideTimeout = null;
        semiSidebar.classList.add('visible');
        document.body.classList.add('sidebar-open');
    });

    semiSidebar.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            if (collegePanel && collegePanel.classList.contains('show')) return;
            semiSidebar.classList.remove('visible');
            document.body.classList.remove('sidebar-open');
            hideTimeout = null;
        }, 300);
    });

    // make first active
    items[0]?.classList.add('active');
}

// STUDENT PAGE FUNCTIONALITY

const addBtn = document.getElementById("addStudentBtn");

if (addBtn) {

    const modal = document.getElementById("studentModal");
    const closeModal = document.getElementById("closeModal");
    const saveBtn = document.getElementById("saveStudent");
    const tableBody = document.querySelector("#studentTable tbody");

    addBtn.addEventListener("click", () => {
        modal.classList.add("show");

    });
    closeModal.addEventListener("click", () => {
        modal.classList.remove("show");
    });
    saveBtn.addEventListener("click", () => {
        const name = document.getElementById("nameInput").value;
        const branch = document.getElementById("branchInput").value;
        const company = document.getElementById("companyInput").value;
        const pkg = document.getElementById("packageInput").value;
        if (!name || !branch || !company || !pkg) {
            alert("Please fill all fields");
            return;
        }
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${branch}</td>
            <td>${company}</td>
            <td>${pkg}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);
        modal.classList.remove("show");
    });
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-btn")) {
            e.target.closest("tr").remove();
        }
    });
}

// Generate particles
const particleContainer = document.querySelector(".particles");

if (particleContainer) {
    const blackShinyColors = [
        { bg: "#000000", glow: "rgba(255, 255, 255, 0.9)" },
        { bg: "#1a1a1a", glow: "rgba(230, 230, 230, 1)" },
        { bg: "#080808", glow: "rgba(255, 255, 255, 0.8)" }
    ];

    for (let i = 0; i < 80; i++) {
        const particle = document.createElement("span");
        const colorScheme = blackShinyColors[Math.floor(Math.random() * blackShinyColors.length)];

        // Start from middle region
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = Math.random() * 50 + "vh"; // Relocated to top upper section

        particle.style.animationDuration = 8 + Math.random() * 6 + "s";
        particle.style.animationDelay = Math.random() * 5 + "s";

        // Randomize size slightly (larger for more visibility)
        const size = 2.5 + Math.random() * 2.5;
        particle.style.width = size + "px";
        particle.style.height = size + "px";

        // Set color
        particle.style.background = colorScheme.bg;
        // Enhanced shiny black effect
        particle.style.boxShadow = `0 0 5px ${colorScheme.glow}, 0 0 10px rgba(255, 255, 255, 0.4), 0 0 15px rgba(255, 255, 255, 0.2)`;

        particleContainer.appendChild(particle);
    }
}

// Generate stars for the upper region
if (particleContainer) {
    for (let i = 0; i < 40; i++) {
        const star = document.createElement("span");
        star.classList.add("star");

        // Position below the midpoint so they emerge from behind the lower region
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = Math.random() * 50 + "vh"; // Relocated to top upper section

        const duration = 12 + Math.random() * 8;
        star.style.animationDuration = duration + "s";
        star.style.animationDelay = Math.random() * 5 + "s";

        const size = 1.5 + Math.random() * 2.5;
        star.style.width = size + "px";
        star.style.height = size + "px";

        particleContainer.appendChild(star);
    }
}

const glow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {
    if (glow) {
        requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        });
    }
});

/**
 * Counting animation for numbers
 */
function animateValue(obj, start, end, duration, suffix = "") {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.innerHTML = value + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end + suffix;
        }
    };
    window.requestAnimationFrame(step);
}

function runCounters() {
    document.querySelectorAll(".number").forEach(counter => {
        const target = parseFloat(counter.getAttribute("data-target") || 0);
        const suffix = counter.getAttribute("data-suffix") || "";
        const current = parseFloat(counter.innerHTML.replace(suffix, "")) || 0;
        
        if (target !== current) {
            animateValue(counter, 0, target, 800, suffix);
        }
    });
}

function updateContextIndicator(college, year) {
    const navCollegeDisplay = document.getElementById('navCollegeDisplay');
    if (navCollegeDisplay) {
        navCollegeDisplay.innerHTML = `${college} <span style="opacity: 0.4; margin: 0 5px;">|</span> ${year || 'Overall'}`;
    }
    
    // Update dashboard title area context if exists
    const dashSubText = document.getElementById('dashSubText');
    if (dashSubText && year) {
        // Add sourced from indicator
        const sourceLabel = document.querySelector('.footer-note')?.innerText || "Data sourced from official placement records";
        console.log("UX Refined: Context set to", college, year);
    }
}

function toggleSkeletons(container, active) {
    if (!container) return;
    if (active) {
        container.classList.add("loading-shimmer");
        // Create skeleton overlays if needed or just add class
    } else {
        container.classList.remove("loading-shimmer");
    }
}

// FETCH DASHBOARD STATS
// FETCH DASHBOARD STATS
async function fetchDashboardStats(year = "2025") {
    const statsContainer = document.querySelector(".stats-container");
    const subText = document.getElementById("dashSubText");
    const highlightsList = document.getElementById("dashHighlightsList");
    const college = localStorage.getItem("college") || "USAR";

    // Update Header Context immediately for responsiveness
    updateContextIndicator(college, year);

    // Show skeletons in cards
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.classList.add("skeleton-active");
        const num = card.querySelector(".number");
        if (num) num.style.opacity = "0"; // Hide actual number while loading
    });

    try {
        const college = localStorage.getItem("college") || "USAR";
        
        console.log(`[DATA-ISOLATION] Fetching Dashboard Stats | College: ${college} | Year: ${year}`);
        
        // CENTRALIZED DATA FLOW: Always use the dynamic Analytics API (Single Source of Truth)
        const response = await window.api.get(`/companies/analytics?batch_year=${year}`);
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();

        // Also fetch companies for the list if needed
        const compResponse = await window.api.get(`/companies?batch_year=${year}`);
        const companies = compResponse.ok ? await compResponse.json() : [];

        // Ensure minimum 300ms for visual transition
        await new Promise(resolve => setTimeout(resolve, 300));

        // Define variables for highlights and popups
        const bs = data.batch_stats || {};
        const companiesVisited = bs.companies_visited || data.total_companies || 0;
        const companiesOffered = bs.companies_offered || 0;
        const totalCompanies = data.total_companies || 0;
        const avgPackage = data.avg_package || 0;
        const highestPackage = data.highest_package || 0;
        const totalPlaced = data.total_placed || 0;
        const activelyParticipated = bs.actively_participated || data.total_enrolled || 0;
        const totalStudents = bs.total_students || activelyParticipated;

        const elTotalCompanies = document.getElementById("dashCompanies");
        const elHighest = document.getElementById("dashHighest");
        const elHighestCap = document.getElementById("dashHighestCaption");
        const elAverage = document.getElementById("dashAverage");
        const elPlaced = document.getElementById("dashPlaced");
        const elEnrolled = document.getElementById("dashEnrolled");
        const elRate = document.getElementById("dashRate");
        const elSubText = document.getElementById("dashSubText");
        const dashTitle = document.getElementById("dashTitle");

        if (dashTitle) dashTitle.textContent = `${year || 'Overall'} Placement Overview`;

        // Update main numbers using data-target for counters
        if (elTotalCompanies) {
            elTotalCompanies.setAttribute("data-target", companiesVisited);
            // Suffix logic for 80+ companies in USAR 2025
            if (college === "USAR" && year === "2025" && companiesVisited >= 80) {
                elTotalCompanies.setAttribute("data-suffix", "+");
            } else {
                elTotalCompanies.removeAttribute("data-suffix");
            }
        }
        if (elHighest) elHighest.setAttribute("data-target", highestPackage);
        if (elAverage) elAverage.setAttribute("data-target", avgPackage);
        if (elPlaced) elPlaced.setAttribute("data-target", totalPlaced);
        if (elEnrolled) elEnrolled.setAttribute("data-target", activelyParticipated);
        if (elRate) elRate.setAttribute("data-target", data.placement_rate || 0);

        // Update enriched card captions
        const elCompaniesCap = document.getElementById("dashCompaniesCaption");
        const elPlacedCap = document.getElementById("dashPlacedCaption");
        const elAvgCap = document.getElementById("dashAvgCaption");
        const elEnrolledCap = document.getElementById("dashEnrolledCaption");

        if (elCompaniesCap) elCompaniesCap.textContent = college === "USICT" ? `Documented Success Rate` : `${companiesOffered} Offered Jobs`;
        if (elPlacedCap) elPlacedCap.textContent = college === "USICT" ? `Total documented offers` : `out of ${activelyParticipated} participated`;
        if (elAvgCap) elAvgCap.textContent = `LPA across all companies`;
        if (elEnrolledCap) elEnrolledCap.textContent = college === "USICT" ? `${year} Placement Statistics` : `${totalStudents} Total • ${activelyParticipated} Participated`;

        // Update subtexts & captions
        if (elSubText) {
            elSubText.innerHTML = `${totalPlaced} Offers • ${companiesVisited}+ Companies Visited • ${data.placement_rate || 0}% Placement Rate`;
        }

        if (elHighestCap) {
            const topComp = data.top_companies && data.top_companies[0] ? data.top_companies[0].name : college;
            elHighestCap.textContent = `Offered by ${topComp}`;
        }

        // Trigger counters to animate new values
        runCounters();

        if (data) {
            updateHeroCarousel(data, year || "Overall");
        }

        // --- DYNAMIC PLACEMENT INSIGHTS ---
        if (highlightsList) {
            let insights = [];
            
            // 1. Highest Package Insight
            if (highestPackage > 0) {
                const topComp = data.top_companies && data.top_companies[0] ? data.top_companies[0].name : "Elite Recruitment";
                insights.push({
                    icon: "💰",
                    title: "Package Peak",
                    text: `Highest package of <strong>₹${highestPackage} LPA</strong> offered by <strong>${topComp}</strong>.`
                });
            }

            // 2. Top Recruiter Insight
            if (companies.length > 0) {
                // Find company with most students (from recruitment API data)
                const recRes = await window.api.get(`/companies/recruitment?batch_year=${year}`);
                const recData = recRes.ok ? await recRes.json() : { companies: [], students_placed: [] };
                
                let maxPlaced = 0;
                let topRecruiter = "";
                recData.companies.forEach((name, i) => {
                    if (recData.students_placed[i] > maxPlaced) {
                        maxPlaced = recData.students_placed[i];
                        topRecruiter = name;
                    }
                });

                if (topRecruiter) {
                    insights.push({
                        icon: "🏢",
                        title: "Top Recruiter",
                        text: `<strong>${topRecruiter}</strong> emerged as the top recruiter with <strong>${maxPlaced} offers</strong>.`
                    });
                }

                // 3. Industry Dominance
                const industries = companies.map(c => c.type || c.category || "Technology");
                const mostCommon = industries.sort((a,b) =>
                    industries.filter(v => v===a).length - industries.filter(v => v===b).length
                ).pop();
                
                if (mostCommon) {
                    insights.push({
                        icon: "📈",
                        title: "Market Trend",
                        text: `Most placements were driven by <strong>${mostCommon}</strong> sector companies.`
                    });
                }
            }

            // 4. Placement Vitality
            if (data.placement_rate > 0) {
                const status = data.placement_rate > 80 ? "exceptional" : "steady";
                insights.push({
                    icon: "⚡",
                    title: "Placement Velocity",
                    text: `The drive maintained a ${status} <strong>${data.placement_rate}%</strong> placement rate for ${year}.`
                });
            }

            // Render as cards if possible, otherwise list
            highlightsList.innerHTML = insights.length > 0 
                ? insights.map(ins => `
                    <div class="insight-card-mini">
                        <div class="insight-icon-box">${ins.icon}</div>
                        <div class="insight-content">
                            <h4 class="insight-title">${ins.title}</h4>
                            <p class="insight-text">${ins.text}</p>
                        </div>
                    </div>
                `).join('')
                : `<div class="insight-placeholder">No patterns identified for this criteria yet</div>`;
        }

        // Setup Popup Logic
        const glassPopup = document.getElementById("glassPopup");
        const glassPopupTitle = document.getElementById("glassPopupTitle");
        const glassPopupBody = document.getElementById("glassPopupBody");
        const closeGlassPopup = document.getElementById("closeGlassPopup");

        const showPopup = (title, htmlContent) => {
            if (!glassPopup) return;
            glassPopupTitle.textContent = title;
            glassPopupBody.innerHTML = htmlContent;
            glassPopup.style.display = 'flex';
            setTimeout(() => glassPopup.classList.add("show"), 10);
        };

        if (closeGlassPopup && glassPopup) {
            closeGlassPopup.onclick = () => {
                glassPopup.classList.remove("show");
                setTimeout(() => glassPopup.style.display = 'none', 400);
            };
        }

        // Attach OnClicks with null guards
        const cardCompanies = document.getElementById("card-companies");
        if (cardCompanies) {
            cardCompanies.onclick = () => {
                const sorted = [...companies].sort((a, b) => {
                    const pkgA = parseFloat((a.package || "").match(/(\d+(\.\d+)?)/)?.[1] || 0);
                    const pkgB = parseFloat((b.package || "").match(/(\d+(\.\d+)?)/)?.[1] || 0);
                    return pkgB - pkgA;
                });
                const uniqueNames = [...new Set(sorted.map(c => c.company_name))].slice(0, 10);
                let bodyHtml = `<p>A total of <strong>${totalCompanies} companies</strong> participated. Top recruiters included:</p><ul style="list-style:none; padding:10px 0;">`;
                uniqueNames.forEach((name, i) => bodyHtml += `<li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:var(--primary); font-weight:bold; margin-right:10px;">#${i + 1}</span> ${name}</li>`);
                bodyHtml += `</ul>`;
                showPopup("Top Recruiter Analysis", bodyHtml);
            };
        }

        const cardPlaced = document.getElementById("card-placed") || document.getElementById("card-placed-students");
        if (cardPlaced) {
            cardPlaced.onclick = () => {
                let bodyHtml = `<p><strong>${totalPlaced} Students</strong> successfully secured placements for the ${year || 'Overall'} Batch.</p>
                <p style="margin-top:10px; color:#aaa; font-size:14px;">Offers range across Software Engineering, AI/ML, and DevOps domains.</p>`;
                showPopup("Placement Success", bodyHtml);
            };
        }

        // cardHighest Click Handler (ENHANCED for Official Data)
        const cardHighest = document.getElementById("card-highest") || document.getElementById("card-highest-students");
        if (cardHighest) {
            cardHighest.onclick = () => {
                const overallHighest = bs.overall_highest_package || highestPackage;
                let bodyHtml = `<div style="text-align:center; padding:10px 0 25px 0; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                    <p style="opacity:0.6; font-size:13px; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Institutional Peak</p>
                    <strong style="color:var(--primary); font-size:32px; letter-spacing:-1px;">₹${overallHighest} LPA</strong>
                </div>`;

                // Prioritize Official Branch Metrics (e.g. USICT 2022)
                const officialHighest = bs.branch_highest || [];
                const branchDetails = bs.branch_details || {};

                if (officialHighest.length > 0) {
                    bodyHtml += `<h4 style="color:var(--primary); margin:0 0 15px 0; font-size:15px; font-weight:600;">Departmental Performance (Official)</h4>`;
                    bodyHtml += `<div style="display:flex; flex-direction:column; gap:12px;">`;
                    officialHighest.forEach(r => {
                        const pct = (r.value / overallHighest) * 100;
                        bodyHtml += `
                        <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:12px; border:1px solid rgba(212, 175, 55, 0.1);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span style="font-weight:600; font-size:14px; color:rgba(255,255,255,0.9);">${r.name}</span>
                                <strong style="color:var(--primary); font-size:16px;">${r.value} LPA</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); border-radius:10px; height:8px; overflow:hidden; position:relative;">
                                <div style="background:linear-gradient(90deg, var(--primary-dark), var(--primary)); height:100%; width:${pct}%; border-radius:10px; box-shadow: 0 0 10px var(--pro-glow-wide);"></div>
                            </div>
                        </div>`;
                    });
                    bodyHtml += `</div>`;
                } else if (Object.keys(branchDetails).length > 0) {
                    // Fallback to calculated samples
                    bodyHtml += `<h4 style="color:var(--primary); margin:0 0 15px 0;">Branch-wise Analysis (Calculated)</h4>`;
                    bodyHtml += `<div style="display:flex; flex-direction:column; gap:8px;">`;
                    for (const [branch, info] of Object.entries(branchDetails)) {
                        const pct = (info.highest_package / overallHighest) * 100;
                        bodyHtml += `
                        <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:10px; border-left:4px solid var(--primary);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                <span style="font-weight:600;">${branch}</span>
                                <strong style="color:var(--primary);">${info.highest_package} LPA</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.08); border-radius:4px; height:6px; overflow:hidden;">
                                <div style="background:var(--primary); height:100%; width:${pct}%; border-radius:4px;"></div>
                            </div>
                        </div>`;
                    }
                    bodyHtml += `</div>`;
                }
                showPopup("Highest Package Distribution", bodyHtml);
            };
        }

        // cardAverage Click Handler (ENHANCED for Official Data)
        const cardAverage = document.getElementById("card-average");
        if (cardAverage) {
            cardAverage.onclick = () => {
                const overallAvg = bs.overall_avg_package || avgPackage;
                let bodyHtml = `<div style="text-align:center; padding:10px 0 25px 0; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                    <p style="opacity:0.6; font-size:13px; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Institutional Average</p>
                    <strong style="color:var(--primary); font-size:32px; letter-spacing:-1px;">₹${overallAvg} LPA</strong>
                </div>`;

                // Prioritize Official Branch Averages (e.g. USICT 2022)
                const officialAverage = bs.branch_average || [];
                const branchDetails = bs.branch_details || {};

                if (officialAverage.length > 0) {
                    bodyHtml += `<h4 style="color:var(--primary); margin:0 0 15px 0; font-size:15px; font-weight:600;">Departmental Average (Official)</h4>`;
                    bodyHtml += `<div style="display:flex; flex-direction:column; gap:12px;">`;
                    
                    const maxAvg = Math.max(...officialAverage.map(r => r.value));
                    officialAverage.forEach(r => {
                        const pct = (r.value / maxAvg) * 100;
                        bodyHtml += `
                        <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:12px; border:1px solid rgba(212, 175, 55, 0.1);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span style="font-weight:600; font-size:14px; color:rgba(255,255,255,0.9);">${r.name}</span>
                                <strong style="color:var(--primary); font-size:16px;">${r.value} LPA</strong>
                            </div>
                            <div style="background:rgba(255,255,100,0.05); border-radius:10px; height:8px; overflow:hidden; position:relative;">
                                <div style="background:linear-gradient(90deg, #B8860B, var(--primary)); height:100%; width:${pct}%; border-radius:10px; box-shadow: 0 0 10px var(--pro-glow-wide);"></div>
                            </div>
                        </div>`;
                    });
                    bodyHtml += `</div>`;
                } else if (Object.keys(branchDetails).length > 0) {
                    bodyHtml += `<h4 style="color:var(--primary); margin:20px 0 10px 0;">Branch-wise Insights (Calculated)</h4>`;
                    bodyHtml += `<div style="display:flex; flex-direction:column; gap:8px;">`;
                    const maxAvg = Math.max(...Object.values(branchDetails).map(b => b.avg_package || 0));
                    for (const [branch, info] of Object.entries(branchDetails)) {
                        const pct = maxAvg > 0 ? (info.avg_package / maxAvg) * 100 : 0;
                        bodyHtml += `
                        <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:10px; border-left:4px solid var(--primary);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                <span style="font-weight:600;">${branch}</span>
                                <strong style="color:var(--primary);">${info.avg_package} LPA</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.08); border-radius:4px; height:6px; overflow:hidden;">
                                <div style="background:var(--primary); height:100%; width:${pct}%; border-radius:4px;"></div>
                            </div>
                        </div>`;
                    }
                    bodyHtml += `</div>`;
                }
                showPopup("Average Package Analysis", bodyHtml);
            };
        }

        const cardRate = document.getElementById("card-rate");
        if (cardRate) {
            cardRate.onclick = () => {
                let bodyHtml = `<p>Current Placement Rate: <strong>${data.placement_rate}%</strong></p>
                <p style="margin-top:10px; color:#aaa;">Calculated as (Total Placed / Total Enrolled students).</p>`;
                showPopup("Placement Rate Analysis", bodyHtml);
            };
        }

        const cardEnrolled = document.getElementById("card-enrolled");
        if (cardEnrolled) {
            cardEnrolled.onclick = () => {
                let bodyHtml = `<p>Total Registered Students: <strong>${data.total_enrolled}</strong></p>
                <p style="margin-top:10px; color:#aaa;">Total students eligible for the ${year || 'Overall'} placement drive.</p>`;
                showPopup("Enrollment Details", bodyHtml);
            };
        }

        // Re-trigger counters
        if (typeof runCounters === 'function') runCounters();

        // End fade in
        if (statsContainer) {
            statsContainer.classList.remove("fade-out");
            statsContainer.classList.add("fade-in");
        }
        if (subText) {
            subText.classList.remove("fade-out");
            subText.classList.add("fade-in");
        }
        if (highlightsList) {
            highlightsList.classList.remove("fade-out");
            highlightsList.classList.add("fade-in");
        }

        // Remove skeletons and trigger count-up
        cards.forEach(card => {
            card.classList.remove("skeleton-active");
            const num = card.querySelector(".number");
            if (num) num.style.opacity = "1";
        });

        runCounters();

    } catch (error) {
        console.error("Dashboard stats error:", error);
        cards.forEach(card => card.classList.remove("skeleton-active"));
        if (subText) subText.innerHTML = `<span style="color:var(--danger)">Offline: Placement data not added yet for this college</span>`;
    }
}

// FETCH RECRUITMENT DATA (PDF EXTRACTION)
async function fetchRecruitmentData(year = "2025") {
    const tableBody = document.getElementById("recruitmentTableBody");
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 40px; opacity:0.6;">Loading recruitment data...</td></tr>`;

    try {
        const response = await window.api.get(`/companies/recruitment?batch_year=${year}`);
        if (!response.ok) throw new Error("Recruitment fetch failed");
        const data = await response.json();

        // 1. Populate the 'Placement History' (Mini Dashboard View)
        const histTable = document.getElementById("placementHistoryBody");
        if (histTable) {
            if (data.companies.length === 0) {
                histTable.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 40px; opacity:0.6;">No data for ${year}.</td></tr>`;
            } else {
                histTable.innerHTML = data.companies.map((name, i) => `
                    <tr>
                        <td style="font-weight:600;">${name}</td>
                        <td>${data.students_placed[i]} Students</td>
                        <td style="opacity:0.6;">${year}</td>
                    </tr>
                `).join('');
            }
        }

        // 2. Populate the 'Companies' Section Brief Table (If it exists)
        const briefTable = document.getElementById("companiesBriefTableBody");
        if (briefTable) {
            if (data.companies.length === 0) {
                briefTable.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; opacity:0.6;">No companies recorded for ${year}.</td></tr>`;
            } else {
                briefTable.innerHTML = data.companies.map((name, i) => `
                    <tr>
                        <td><strong>${name}</strong></td>
                        <td style="opacity:0.7;">${data.company_types[i] || "Services"}</td>
                        <td style="color:var(--primary); font-weight:700;">Variable</td>
                        <td>${data.students_placed[i]}</td>
                        <td><span class="status-pill status-active">Active</span></td>
                        <td>—</td>
                    </tr>
                `).join('');
            }
        }

    } catch (error) {
        console.error("Recruitment fetch error:", error);
    }
}

// Call on load
document.addEventListener("DOMContentLoaded", () => {
    // Logic now handled by dynamic batch fetcher at the end of the file

    // 2. Set tabs active state and add listeners (for analytics page if present)
    if (batchTabsContainer) {
        batchTabsContainer.querySelectorAll(".batch-tab").forEach(tab => {
            const yearAttr = tab.getAttribute("data-year") || "";
            if (yearAttr === storedYear) {
                batchTabsContainer.querySelectorAll(".batch-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
            }
            tab.addEventListener("click", () => {
                const newYear = tab.getAttribute("data-year") || "";
                if (localStorage.getItem("selectedBatchYear") === newYear) return;

                batchTabsContainer.querySelectorAll(".batch-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                localStorage.setItem("selectedBatchYear", newYear);
                fetchDashboardStats(newYear);
            });
        });
    }

    // 3. Batch Year Selector (Dropdown on Students Page)
    const batchYearSelector = document.getElementById("batchYearSelector");
    if (batchYearSelector) {
        batchYearSelector.value = storedYear;
        batchYearSelector.addEventListener("change", (e) => {
            const newYear = e.target.value;
            localStorage.setItem("selectedBatchYear", newYear);

            // Sync all page components
            fetchDashboardStats(newYear);
            fetchRecruitmentData(newYear);
            if (typeof fetchAllStudents === 'function') fetchAllStudents(newYear);
        });
    }

    // 4. Initial Fetch
    fetchDashboardStats(storedYear);
    fetchRecruitmentData(storedYear);
    fetchAllStudents(storedYear);
});

async function fetchAllStudents(year = "2025") {
    const tableBody = document.getElementById("fullStudentsTableBody");
    if (!tableBody) return;

    try {
        const response = await window.api.get(`/students?batch_year=${year}`);
        let data = await response.json();

        // Filter by year
        data = data.filter(p => parseInt(p.year) === parseInt(year));

        const isGuest = !localStorage.getItem("user");

        const render = (filteredData) => {
            if (filteredData.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; opacity:0.6;">No students found matching your criteria.</td></tr>';
                return;
            }

            tableBody.innerHTML = filteredData.map(s => {
                let name = s.student_name;
                if (isGuest) {
                    const pts = s.student_name.trim().split(/\s+/);
                    name = pts.length > 1 ? `${pts[0]} ${pts[pts.length - 1][0]}.` : (name.length > 3 ? name.slice(0, 3) + '...' : '***');
                }
                return `
                    <tr>
                        <td style="font-weight:600; color:var(--text-main);">${name}</td>
                        <td>${s.branch}</td>
                        <td style="color:var(--primary); font-weight:500;">${s.company_name}</td>
                        <td style="opacity:0.8;">${s.package_str || (s.package ? s.package + ' LPA' : '—')}</td>
                        <td>${s.year}</td>
                    </tr>
                `;
            }).join("");
        };

        render(data);

        const searchInput = document.getElementById("studentSearch");
        const branchFilter = document.getElementById("branchFilter");

        if (searchInput || branchFilter) {
            const updateFilters = () => {
                const term = searchInput ? searchInput.value.toLowerCase() : "";
                const branch = branchFilter ? branchFilter.value : "all";
                const filtered = data.filter(s => {
                    const matchesSearch = s.student_name.toLowerCase().includes(term) || s.company_name.toLowerCase().includes(term);
                    const matchesBranch = branch === "all" || s.branch === branch;
                    return matchesSearch && matchesBranch;
                });
                render(filtered);
            };

            if (searchInput) searchInput.addEventListener("input", updateFilters);
            if (branchFilter) branchFilter.addEventListener("change", updateFilters);
        }

    } catch (e) {
        console.error("Student list error:", e);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color:var(--danger);">Error loading student data.</td></tr>';
    }
}


document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        if (href && href.endsWith(".html")) {
            e.preventDefault();
            document.body.classList.add("fade-out");

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        }
    });
});
// AUTH MODAL LOGIC
const authModal = document.getElementById("authModal");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const closeAuthModal = document.getElementById("closeAuthModal");
const authToggle = document.getElementById("authToggle");

if (authModal && loginBtn && signupBtn && closeAuthModal) {
    const showModal = (isSignup = false) => {
        authModal.style.display = "flex";
        setTimeout(() => {
            authModal.classList.add("show");
        }, 10);
        authToggle.checked = isSignup;
    };

    const hideModal = () => {
        authModal.classList.remove("show");
        setTimeout(() => {
            authModal.style.display = "none";
        }, 400);
    };

    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showModal(false);
    });

    signupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showModal(true);
    });

    closeAuthModal.addEventListener("click", hideModal);

    authModal.addEventListener("click", (e) => {
        if (e.target === authModal) {
            hideModal();
        }
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            hideModal();
        }
    });
}

// Helper: create a single star element
function createStar(extraClass) {
    const star = document.createElement("span");
    star.classList.add("star");
    if (extraClass) star.classList.add(extraClass);

    star.style.left = Math.random() * 100 + "vw";
    star.style.top = (66 + Math.random() * 29) + "vh";

    const duration = 10 + Math.random() * 10;
    star.style.animationDuration = duration + "s";
    star.style.animationDelay = Math.random() * 6 + "s";

    const size = 1.5 + Math.random() * 2.5;
    star.style.width = size + "px";
    star.style.height = size + "px";

    return star;
}

// Inject extra emerald stars for dark mode
function addDarkStars() {
    const container = document.querySelector(".particles");
    if (!container) return;
    for (let i = 0; i < 35; i++) {
        container.appendChild(createStar("dark-extra-star"));
    }
}

// Remove extra dark-mode stars
function removeDarkStars() {
    document.querySelectorAll(".dark-extra-star").forEach(el => el.remove());
}

// THEME SWITCHER LOGIC
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    // Initial sync
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
        // Don't call addDarkStars directly to avoid potential race conditions
        // Wait for DOM or call it with a check
        setTimeout(addDarkStars, 0);
    } else {
        body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
        localStorage.setItem('theme', 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                addDarkStars();
            } else {
                body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                removeDarkStars();
            }
        });
    }
}

// Call theme init correctly
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
} else {
    initTheme();
}

// HAMBURGER AUTO-CLOSE LOGIC
document.addEventListener("DOMContentLoaded", () => {
    const hamburgerToggle = document.getElementById("hamburgerToggle");
    const hamburgerContainer = document.querySelector(".hamburger-container");
    const profileTrigger = document.getElementById("profileTrigger");
    const profileDropdown = document.getElementById("profileDropdown");

    // Profile Dropdown Toggle
    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("show");

            // Close hamburger if opening profile
            if (profileDropdown.classList.contains("show") && hamburgerToggle) {
                hamburgerToggle.checked = false;
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
                profileDropdown.classList.remove("show");
            }
        });

        // Close dropdown if hamburger is opened
        if (hamburgerToggle) {
            hamburgerToggle.addEventListener("change", () => {
                if (hamburgerToggle.checked) {
                    profileDropdown.classList.remove("show");
                }
            });
        }
    }

    if (hamburgerToggle && hamburgerContainer) {
        let closeTimeout;

        const startCloseTimer = () => {
            if (hamburgerToggle.checked) {
                clearTimeout(closeTimeout);
                closeTimeout = setTimeout(() => {
                    hamburgerToggle.checked = false;
                }, 2500); // 2.5 seconds auto-close delay
            }
        };

        const stopCloseTimer = () => {
            clearTimeout(closeTimeout);
        };

        hamburgerToggle.addEventListener("change", () => {
            if (hamburgerToggle.checked) {
                if (!hamburgerContainer.matches(':hover')) {
                    startCloseTimer();
                }
            } else {
                stopCloseTimer();
            }
        });

        hamburgerContainer.addEventListener("mouseenter", stopCloseTimer);
        hamburgerContainer.addEventListener("mouseleave", () => {
            if (hamburgerToggle.checked) {
                startCloseTimer();
            }
        });
    }
});


// PASSWORD EYE REVEAL (2-second timed peek)
document.addEventListener("DOMContentLoaded", () => {
    const revealDuration = 2000; // ms

    document.querySelectorAll(".pw-eye").forEach(btn => {
        let hideTimer = null;

        btn.addEventListener("click", () => {
            const inputId = btn.getAttribute("data-for");
            const input = document.getElementById(inputId);
            if (!input) return;

            const eyeOpen = btn.querySelector(".eye-open");
            const eyeClosed = btn.querySelector(".eye-closed");

            // If already revealing, reset the timer (user clicked again)
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }

            // Reveal
            input.type = "text";
            eyeOpen.style.display = "none";
            eyeClosed.style.display = "";

            // Restart pulse animation
            btn.classList.remove("revealing");
            void btn.offsetWidth; // force reflow to restart animation
            btn.classList.add("revealing");

            // Auto-hide after 2 seconds
            hideTimer = setTimeout(() => {
                input.type = "password";
                eyeOpen.style.display = "";
                eyeClosed.style.display = "none";
                btn.classList.remove("revealing");
                hideTimer = null;
            }, revealDuration);
        });
    });
});

// The auth logic has been moved to js/auth.js and js/api.js for better modularity and JWT support.
// Please check those files for login, register, profile and logout handling.

// Re-wire session check (removed loadProfile call from DOMContentLoaded)
document.addEventListener("DOMContentLoaded", () => {
    // Other initializations can remain here
});


/* HERO CAROUSEL LOGIC - ENHANCED AUTOPLAY */
document.addEventListener('DOMContentLoaded', () => { initHeroCarousel(); });
// 🌟 DYNAMIC HERO CAROUSEL ENGINE (DATA-DRIVEN)
let carouselAutoTimer;

function updateHeroCarousel(data, yearLabel) {
    const inner = document.getElementById('heroCarouselInner');
    const dotsContainer = document.getElementById('carouselDots');
    if (!inner || !dotsContainer) return;

    const bs = data.batch_stats || {};
    const slides = [];
    const college = localStorage.getItem("college") || "USAR";

    // 1. Highest Package
    if (data.highest_package) {
        slides.push({
            tag: `${yearLabel} Placement Milestone`,
            title: "Highest Package",
            value: `₹${data.highest_package}`,
            unit: "LPA",
            subtitle: `Secured by top performing talent in ${yearLabel}`,
            logos: (college === "USICT" || yearLabel === "2024") ? [] : ["../assets/godaddy_clean.png"]
        });
    }

    // 2. Average CTC (Enhanced with Hover-Tree)
    if (data.avg_package) {
        slides.push({
            tag: "Institutional Growth",
            title: "Average CTC",
            value: `₹${data.avg_package}`,
            unit: "LPA",
            subtitle: `Sustained high average across all engineering streams`,
            logos: [],
            isAverageSlide: true,
            branches: Object.entries(bs.branch_details || {}).map(([name, info]) => ({
                name: name.replace("AI & ", ""), // Shorten for the tree
                package: info.avg_package
            }))
        });
    }

    // 3. Drive Magnitude
    if (data.total_companies) {
        slides.push({
            tag: "Corporate Outreach",
            title: "Companies Visited",
            value: `${data.total_companies}`,
            unit: "Firms",
            subtitle: `Participated in the ${yearLabel} recruitment drive`,
            logos: college === "USICT" ? [] : (yearLabel === "2024" ? ["../assets/infosys_clean.png", "../assets/genpact_clean.png"] : ["../assets/infosys_clean.png", "../assets/genpact_clean.png", "../assets/tvs_clean.png"])
        });
    }

    // 4. Success Milestone
    if (data.total_placed) {
        slides.push({
            tag: "Recruitment Success",
            title: "Total Selections",
            value: `${data.total_placed}`,
            unit: "Students",
            subtitle: `Successfully placed in leading global organizations`,
            logos: []
        });
    }

    // 5. Success Ratio
    if (data.placement_rate) {
        slides.push({
            tag: "Success Ratio",
            title: "Placement Rate",
            value: `${data.placement_rate}`,
            unit: "%",
            subtitle: `Overall selection conversion for ${yearLabel} batch`,
            logos: []
        });
    }

    // 6. Student Engagement
    if (bs.actively_participated) {
        slides.push({
            tag: "Student Engagement",
            title: "Participated",
            value: `${bs.actively_participated}`,
            unit: "Pool",
            subtitle: `Active students screened for placement opportunities`,
            logos: []
        });
    }

    // 7. Internship Offers (NEW: As requested for 2021)
    if (data.internship_offers) {
        slides.push({
            tag: "Bridge to Career",
            title: "Internship Offers",
            value: `${data.internship_offers}`,
            unit: "Offers",
            subtitle: `Successful summer and winter internship conversions`,
            logos: []
        });
    }

    // UPDATE Dashboard Card for Internships (Dynamic Override)
    const elEnrolledCap = document.getElementById("dashEnrolledCaption");
    const elEnrolledTitle = document.getElementById("dashEnrolledTitle") || document.querySelector("#card-enrolled .stat-title");
    if (data.internship_offers > 0 && elEnrolledTitle) {
        elEnrolledTitle.textContent = "Internship Offers";
        if (elEnrolledCap) elEnrolledCap.textContent = `Documented opportunities in ${yearLabel}`;
        const elEnrolled = document.getElementById("dashEnrolled");
        if (elEnrolled) elEnrolled.setAttribute("data-target", data.internship_offers);
    } else if (elEnrolledTitle) {
        elEnrolledTitle.textContent = "Students Enrolled";
        if (elEnrolledCap) elEnrolledCap.textContent = college === "USICT" ? `${yearLabel} Placement Statistics` : `${totalStudents} Total • ${activelyParticipated} Participated`;
        const elEnrolled = document.getElementById("dashEnrolled");
        if (elEnrolled) elEnrolled.setAttribute("data-target", activelyParticipated);
    }


    // Render slides
    inner.innerHTML = slides.map((s, i) => `
        <div class="carousel-item ${i === 0 ? 'active' : ''} ${s.isAverageSlide ? 'is-avg-slide' : ''}">
            <div class="slide-content">
                <span class="slide-tag">${s.tag}</span>
                <h2 class="slide-title">${s.title}</h2>
                <p class="slide-subtitle">${s.subtitle}</p>
            </div>
            <div class="slide-data-visual">
                ${s.logos && s.logos.length > 0 ? `
                   <div class="slide-logo-group">
                       ${s.logos.map(l => `<img src="${l}" class="slide-logo" alt="Logo">`).join('')}
                   </div>
                ` : ''}
                
                ${s.isAverageSlide ? `
                    <div class="branch-tree">
                        ${s.branches.map((b, bi) => `
                            <div class="branch-item branch-${bi + 1}">
                                <div class="branch-line"></div>
                                <div class="branch-node">
                                    <span class="branch-name">${b.name}</span>
                                    <span class="branch-val">₹${b.package} LPA</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="slide-value">${s.value} <span class="unit">${s.unit}</span></div>
            </div>
        </div>
    `).join('');

    // Render dots
    dotsContainer.innerHTML = slides.map((_, i) => `
        <span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
    `).join('');

    // Re-initialize carousel logic
    initHeroCarousel();
}

function initHeroCarousel() {
    const carousel = document.getElementById('heroCarousel');
    if (!carousel) return;

    // Flush existing timer
    if (carouselAutoTimer) clearInterval(carouselAutoTimer);

    const slides = Array.from(carousel.querySelectorAll('.carousel-item'));
    const dots = Array.from(carousel.querySelectorAll('.dot'));
    if (slides.length === 0) return;

    let activeIndex = 0;
    const scrollInterval = 4000;

    function applyState(idx) {
        slides.forEach((s, i) => s.classList.toggle('active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        activeIndex = idx;
    }

    function rotate() {
        activeIndex = (activeIndex + 1) % slides.length;
        applyState(activeIndex);
    }

    function startBehavior() {
        if (carouselAutoTimer) clearInterval(carouselAutoTimer);
        carouselAutoTimer = setInterval(rotate, scrollInterval);
    }

    function pauseBehavior() {
        if (carouselAutoTimer) clearInterval(carouselAutoTimer);
    }

    // Bind events with modern listeners
    carousel.onmouseenter = pauseBehavior;
    carousel.onmouseleave = startBehavior;

    dots.forEach((dot, i) => {
        dot.onclick = (e) => {
            e.preventDefault();
            pauseBehavior();
            applyState(i);
            startBehavior();
        };
    });

    // Final kickstart
    applyState(0);
    startBehavior();
}

function triggerPageRefresh(year) {
    if (typeof fetchDashboardStats === 'function') fetchDashboardStats(year);
    if (typeof fetchRecruitmentData === 'function') fetchRecruitmentData(year);
    if (typeof fetchAllStudents === 'function') fetchAllStudents(year);
    if (typeof loadAnalytics === 'function') loadAnalytics(year);
    if (typeof fetchCompanies === 'function') fetchCompanies();
}

// Call on load
document.addEventListener("DOMContentLoaded", async () => {
    // 1. DYNAMICALLY SETUP BATCH UI FROM DATABASE (Single Source of Truth)
    try {
        const bRes = await window.api.get(`/companies/batches`); // College handled by api.js
        const batches = bRes.ok ? await bRes.json() : [];
        
        const batchSelector = document.getElementById("batchSwitchDropdown");
        const globalFilter = document.getElementById('globalBatchYear') || document.getElementById('batchFilter');

        // Setup Dropdown (NEW - Dropdown Style)
        if (batchSelector) {
            batchSelector.innerHTML = batches.length > 0 
                ? batches.map(y => `<option value="${y}">${y} Batch</option>`).join('') 
                : `<option value="">No Batches Found</option>`;
            
            batchSelector.addEventListener("change", (e) => {
                const y = e.target.value;
                localStorage.setItem("selectedBatchYear", y);
                triggerPageRefresh(y);
            });
        }

        // Setup Dropdowns
        if (globalFilter) {
            globalFilter.innerHTML = batches.length > 0 
                ? batches.map(y => `<option value="${y}">${y} Batch</option>`).join('')
                : `<option value="">No Data</option>`;
        }

        // 2. Restore state correctly
        let storedYear = localStorage.getItem("selectedBatchYear");
        if (!storedYear || !batches.includes(storedYear)) {
            storedYear = batches.length > 0 ? batches[0] : "";
            localStorage.setItem("selectedBatchYear", storedYear);
        }

        // Set active visuals
        if (batchSelector) batchSelector.value = storedYear;
        if (globalFilter) globalFilter.value = storedYear;

        // 3. Initial Data Load
        triggerPageRefresh(storedYear);

        // 4. Transform native selects into Vertical Pill Dropdowns
        initCustomDropdowns();

    } catch (e) {
        console.error("Dashboard init sync failed:", e);
    }
});

/**
 * PLACEPRO CUSTOM DROPDOWN SYSTEM
 * Converts native <select> into futuristic vertical pill-based options
 */
function initCustomDropdowns() {
    document.querySelectorAll('select').forEach(sel => {
        // Skip specialized hidden selects or those already highly customized if any
        if (sel.closest('.no-custom-dropdown')) return;

        let container = sel.closest('.custom-dropdown-container');
        let optionsList, selectedText;

        if (!container) {
            sel.style.display = 'none';
            container = document.createElement('div');
            container.className = 'custom-dropdown-container';
            sel.parentNode.insertBefore(container, sel);
            container.appendChild(sel);

            const trigger = document.createElement('div');
            // We reuse the elite pill design previously applied to selects
            trigger.className = 'select'; // CSS now targets 'select' tag, we replicate it here
            trigger.style.display = 'flex';
            trigger.style.alignItems = 'center';
            trigger.style.justifyContent = 'space-between';
            trigger.style.height = 'auto'; // Let padding handle it
            trigger.style.width = '100%';
            trigger.style.borderRadius = '50px';
            trigger.style.padding = '12px 25px';
            trigger.style.background = 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(15, 15, 15, 0.95))';
            trigger.style.border = '2px solid rgba(212, 175, 55, 0.2)';
            trigger.style.cursor = 'pointer';
            trigger.style.transition = 'all 0.3s ease';

            // Trigger hover effect simulation
            trigger.onmouseenter = () => trigger.style.borderColor = 'rgba(212, 175, 55, 1)';
            trigger.onmouseleave = () => trigger.style.borderColor = 'rgba(212, 175, 55, 0.2)';

            selectedText = document.createElement('span');
            selectedText.style.color = '#D4AF37';
            selectedText.style.fontWeight = '700';
            selectedText.style.textTransform = 'uppercase';
            selectedText.style.fontSize = '14px';
            trigger.appendChild(selectedText);

            const arrow = document.createElement('div');
            arrow.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%23D4AF37" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="stroke: #D4AF37;"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            trigger.appendChild(arrow);
            container.appendChild(trigger);

            optionsList = document.createElement('div');
            optionsList.className = 'custom-dropdown-options';
            container.appendChild(optionsList);

            trigger.onclick = (e) => {
                e.stopPropagation();
                const wasActive = optionsList.classList.contains('active');
                // Close all other instances
                document.querySelectorAll('.custom-dropdown-options').forEach(o => o.classList.remove('active'));
                if (!wasActive) optionsList.classList.add('active');
            };
        } else {
            optionsList = container.querySelector('.custom-dropdown-options');
            selectedText = container.querySelector('span');
        }

        // POPULATE OPTIONS
        const syncOptions = () => {
            optionsList.innerHTML = '';
            selectedText.textContent = sel.options[sel.selectedIndex]?.text || 'SELECT';
            
            Array.from(sel.options).forEach(opt => {
                const pill = document.createElement('div');
                pill.className = 'dropdown-pill-option';
                if (opt.selected) pill.classList.add('selected');
                pill.textContent = opt.text;
                
                pill.onclick = (e) => {
                    e.stopPropagation();
                    sel.value = opt.value;
                    sel.dispatchEvent(new Event('change'));
                    selectedText.textContent = opt.text;
                    optionsList.classList.remove('active');
                    
                    // Visual feedback
                    optionsList.querySelectorAll('.dropdown-pill-option').forEach(p => p.classList.remove('selected'));
                    pill.classList.add('selected');
                };
                optionsList.appendChild(pill);
            });
        };

        syncOptions();

        // Listen for internal content changes (like college switches)
        const observer = new MutationObserver(syncOptions);
        observer.observe(sel, { childList: true });
    });
}

// Global click to close dropdowns
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown-container')) {
        document.querySelectorAll('.custom-dropdown-options').forEach(o => o.classList.remove('active'));
    }
});

function updateBatchUI(batches, college) {
    const batchTabs = document.getElementById("batchSwitchTabs");
    if (batchTabs) {
        batchTabs.innerHTML = batches.length > 0 
            ? batches.map((y, index) => `<button class="batch-tab ${index === 0 ? 'active' : ''}" data-year="${y}">${y} Batch</button>`).join('')
            : `<div style="padding:10px; opacity:0.5;">No Batches Found for ${college}</div>`;
        
        if (batches.length > 0) {
            batchTabs.querySelectorAll(".batch-tab").forEach(tab => {
                tab.addEventListener("click", () => {
                    const y = tab.getAttribute("data-year");
                    batchTabs.querySelectorAll(".batch-tab").forEach(t => t.classList.remove("active"));
                    tab.classList.add("active");
                    localStorage.setItem("selectedBatchYear", y);
                    triggerPageRefresh(y);
                });
            });
        }
    }

    const globalFilter = document.getElementById('globalBatchYear') || document.getElementById('batchFilter') || document.getElementById('batchSwitchDropdown');
    if (globalFilter) {
        globalFilter.innerHTML = batches.length > 0 
            ? batches.map(y => `<option value="${y}">${y} Batch</option>`).join('')
            : `<option value="">No Data</option>`;
        
        if (batches.length > 0) {
            globalFilter.value = localStorage.getItem("selectedBatchYear") || batches[0];
            localStorage.setItem("selectedBatchYear", globalFilter.value);
        }
        
        // Trigger select event to sync custom dropdowns
        globalFilter.dispatchEvent(new Event('change'));
    }
}

async function triggerPageRefresh(year) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.classList.add('context-switching');

    try {
        await Promise.all([
            fetchDashboardStats(year),
            fetchRecruitmentData(year)
        ]);
    } catch (e) {
        console.error("Refresh failed:", e);
    } finally {
        if (mainContent) {
            setTimeout(() => {
                mainContent.classList.remove('context-switching');
            }, 300);
        }
    }
}

// Initial Load Sync
document.addEventListener("DOMContentLoaded", async () => {
    const savedCollege = localStorage.getItem("college") || "USAR";
    const savedYear = localStorage.getItem("selectedBatchYear");
    
    // Set initial context before fetching
    if (typeof updateContextIndicator === 'function') {
        updateContextIndicator(savedCollege, savedYear);
    }
    
    // Fetch batches first to know what's available
    try {
        const bRes = await window.api.get(`/companies/batches`);
        const batches = bRes.ok ? await bRes.json() : [];
        
        if (batches.length > 0) {
            const year = savedYear || batches[0];
            localStorage.setItem("selectedBatchYear", year);
            updateBatchUI(batches, savedCollege);
            triggerPageRefresh(year);
        }
    } catch (e) {
        console.error("Initial load failed:", e);
    }
});
