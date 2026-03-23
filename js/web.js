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

    // Click logic
    items.forEach((it) => {
        it.addEventListener('click', e => {
            e.preventDefault();
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
            if (distanceToCenter < revealRadius || semiSidebar.matches(':hover')) {
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
                        semiSidebar.classList.remove('visible');
                        document.body.classList.remove('sidebar-open');
                        hideTimeout = null;
                    }, 800); // Shorter, crisper delay
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
            semiSidebar.classList.remove('visible');
            document.body.classList.remove('sidebar-open');
            hideTimeout = null;
        }, 1500);
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
    document.addEventListener("click", function(e) {
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
        particle.style.top = 40 + Math.random() * 20 + "vh";

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
        star.style.top = (66 + Math.random() * 29) + "vh";

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

const counters = document.querySelectorAll(".number");

function runCounters() {
    document.querySelectorAll(".number").forEach(counter => {
        const updateCounter = () => {
            const target = +counter.getAttribute("data-target");
            const current = +counter.innerText;
            const increment = Math.max(1, Math.ceil(target / 100)); // Ensure it increments

            if (current < target) {
                counter.innerText = Math.ceil(current + increment) > target ? target : Math.ceil(current + increment);
                setTimeout(updateCounter, 20);
            } else {
                counter.innerText = target;
            }
        };

        updateCounter();
    });
}
runCounters();

// FETCH DASHBOARD STATS
// FETCH DASHBOARD STATS
async function fetchDashboardStats(year = "2025") {
    const statsContainer = document.querySelector(".stats-container");
    const subText = document.getElementById("dashSubText");
    const highlightsList = document.getElementById("dashHighlightsList");

    // Start fade out
    if (statsContainer) statsContainer.classList.add("fade-out");
    if (subText) subText.classList.add("fade-out");
    if (highlightsList) highlightsList.classList.add("fade-out");
    
    // Add loading shimmer to cards
    document.querySelectorAll(".card").forEach(card => card.classList.add("stat-card-loading"));

    try {
        // Fetch from unified analytics API
        const response = await fetch(`http://127.0.0.1:5000/api/analytics${year ? '?batch_year=' + year : ''}`);
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();

        // Also fetch companies for highlights list
        const compResponse = await fetch(`http://127.0.0.1:5000/companies${year ? '?batch_year=' + year : ''}`);
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
        if (elTotalCompanies) elTotalCompanies.setAttribute("data-target", companiesVisited);
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

        if (elCompaniesCap) elCompaniesCap.textContent = `${companiesOffered} Offered Jobs`;
        if (elPlacedCap) elPlacedCap.textContent = `out of ${activelyParticipated} participated`;
        if (elAvgCap) elAvgCap.textContent = `LPA across all branches`;
        if (elEnrolledCap) elEnrolledCap.textContent = `${totalStudents} Total • ${activelyParticipated} Participated`;

        // Update subtexts & captions
        if (elSubText) {
            elSubText.innerHTML = `${totalPlaced} Offers • ${companiesVisited}+ Companies Visited • ${data.placement_rate || 0}% Placement Rate`;
        }

        let top3 = [];
        if (elHighestCap) {
            const topComp = data.top_companies && data.top_companies[0] ? data.top_companies[0].name : "USAR";
            elHighestCap.textContent = `Offered by ${topComp}`;
        }
        
        // Highlights Logic
        if (highlightsList && companies.length > 0) {
            const validCompanies = companies.filter(c => c.package && c.package.toLowerCase().includes("lpa"));
            validCompanies.sort((a, b) => {
                const matchA = a.package.match(/(\d+(\.\d+)?)/);
                const matchB = b.package.match(/(\d+(\.\d+)?)/);
                const valA = matchA ? parseFloat(matchA[1]) : 0;
                const valB = matchB ? parseFloat(matchB[1]) : 0;
                return valB - valA;
            });

            top3 = validCompanies.slice(0, 3);
            let html = "";
            if (top3.length > 0) {
                html += `<li><span style="color:var(--primary); margin-right: 8px;">★</span> The highest compensation of <strong>${top3[0].package}</strong> was offered by <strong>${top3[0].company_name}</strong> for the <strong>${top3[0].role}</strong> role.</li>`;
            }
            if (totalCompanies > 0) {
                html += `<li><span style="color:var(--primary); margin-right: 8px;">★</span> A robust placement drive resulted in <strong>${totalCompanies} companies</strong> visiting the campus.</li>`;
            }
            if (avgPackage > 0) {
                html += `<li><span style="color:var(--primary); margin-right: 8px;">★</span> The batch maintained a strong competitive average package of <strong>${avgPackage} LPA</strong>.</li>`;
            }
            highlightsList.innerHTML = html;
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
                uniqueNames.forEach((name, i) => bodyHtml += `<li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:var(--primary); font-weight:bold; margin-right:10px;">#${i+1}</span> ${name}</li>`);
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

        const cardHighest = document.getElementById("card-highest") || document.getElementById("card-highest-students");
        if (cardHighest) {
            cardHighest.onclick = () => {
                const overallHighest = bs.overall_highest_package || highestPackage;
                let bodyHtml = `<p>Overall Highest Package: <strong style="color:var(--primary); font-size:20px;">${overallHighest} LPA</strong></p>`;
                
                const branchDetails = bs.branch_details || {};
                if (Object.keys(branchDetails).length > 0) {
                    bodyHtml += `<h4 style="color:var(--primary); margin:20px 0 10px 0;">Branch-wise Highest Package</h4>`;
                    bodyHtml += `<div style="display:flex; flex-direction:column; gap:8px;">`;
                    for (const [branch, info] of Object.entries(branchDetails)) {
                        const pct = (info.highest_package / overallHighest) * 100;
                        bodyHtml += `
                        <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:8px; border-left:3px solid var(--primary);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                <span style="font-weight:500;">${branch}</span>
                                <strong style="color:var(--primary);">${info.highest_package} LPA</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.08); border-radius:4px; height:6px; overflow:hidden;">
                                <div style="background:var(--primary); height:100%; width:${pct}%; border-radius:4px;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:12px; color:#888;">
                                <span>Placed: ${info.placed} students</span>
                                <span>Median: ${info.median_package} LPA</span>
                            </div>
                        </div>`;
                    }
                    bodyHtml += `</div>`;
                }

                const topCompanyData = data.top_companies && data.top_companies[0];
                if (topCompanyData) {
                    bodyHtml += `<div style="background:rgba(250,204,21,0.1); border:1px solid var(--primary); padding:12px; border-radius:8px; margin-top:15px;">
                        <h4 style="color:var(--primary); margin:0 0 5px 0;">🏆 ${topCompanyData.name}</h4>
                        <p style="margin:0;"><strong>Role:</strong> ${topCompanyData.role} &nbsp;•&nbsp; <strong>Package:</strong> ${topCompanyData.package_str}</p>
                    </div>`;
                }
                showPopup("Highest Package Breakdown", bodyHtml);
            };
        }

        const cardAverage = document.getElementById("card-average");
        if (cardAverage) {
            cardAverage.onclick = () => {
                const overallAvg = bs.overall_avg_package || avgPackage;
                const overallMedian = bs.overall_median_package || 0;
                let bodyHtml = `<p>Overall Average CTC: <strong style="color:var(--primary); font-size:20px;">${overallAvg} LPA</strong></p>`;
                if (overallMedian) {
                    bodyHtml += `<p style="color:#aaa; margin-top:4px;">Median Package: <strong>${overallMedian} LPA</strong></p>`;
                }

                const branchDetails = bs.branch_details || {};
                if (Object.keys(branchDetails).length > 0) {
                    bodyHtml += `<h4 style="color:var(--primary); margin:20px 0 10px 0;">Branch-wise Average Package</h4>`;
                    bodyHtml += `<div style="display:flex; flex-direction:column; gap:8px;">`;
                    
                    const maxAvg = Math.max(...Object.values(branchDetails).map(b => b.avg_package || 0));
                    for (const [branch, info] of Object.entries(branchDetails)) {
                        const pct = maxAvg > 0 ? (info.avg_package / maxAvg) * 100 : 0;
                        bodyHtml += `
                        <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:8px; border-left:3px solid var(--primary);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                <span style="font-weight:500;">${branch}</span>
                                <strong style="color:var(--primary);">${info.avg_package} LPA</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.08); border-radius:4px; height:6px; overflow:hidden;">
                                <div style="background:var(--primary); height:100%; width:${pct}%; border-radius:4px;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:12px; color:#888;">
                                <span>Median: ${info.median_package} LPA</span>
                                <span>Rate: ${info.placement_rate}%</span>
                            </div>
                        </div>`;
                    }
                    bodyHtml += `</div>`;
                }
                showPopup("Average Package Insights", bodyHtml);
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
        
        document.querySelectorAll(".card").forEach(card => card.classList.remove("stat-card-loading"));

        setTimeout(() => {
            if (statsContainer) statsContainer.classList.remove("fade-in");
            if (subText) subText.classList.remove("fade-in");
            if (highlightsList) highlightsList.classList.remove("fade-in");
        }, 400);

    } catch (error) {
        console.error("Dashboard stats error:", error);
        if (statsContainer) statsContainer.classList.remove("fade-out");
        document.querySelectorAll(".card").forEach(card => card.classList.remove("stat-card-loading"));
    }
}

// FETCH RECRUITMENT DATA (PDF EXTRACTION)
async function fetchRecruitmentData() {
    const tableBody = document.getElementById("recruitmentTableBody");
    if (!tableBody) return;

    try {
        const response = await fetch('http://127.0.0.1:5000/api/placements');
        if (!response.ok) throw new Error("Recruitment fetch failed");
        const data = await response.json();

        // Group by company and year
        const grouped = {};
        data.forEach(p => {
            const key = `${p.company_name}|${p.year}`;
            if (!grouped[key]) {
                grouped[key] = {
                    company_name: p.company_name,
                    year: p.year,
                    students: []
                };
            }
            grouped[key].students.push(p);
        });

        tableBody.innerHTML = "";
        
        for (const key in grouped) {
            const group = grouped[key];
            
            // Create main row
            const mainRow = document.createElement("tr");
            mainRow.className = "main-row";
            mainRow.innerHTML = `
                <td>
                    <span class="expand-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                    ${group.company_name}
                    <span class="click-hint">Click to view students</span>
                </td>
                <td>${group.students.length} Students</td>
                <td>${group.year}</td>
            `;
            
            // Create details row
            const detailsRow = document.createElement("tr");
            detailsRow.className = "details-row";
            
            let studentListHtml = group.students.map(s => `
                <li class="student-item">
                    <span class="name">${s.student_name}</span>
                    <span class="branch">${s.branch}</span>
                </li>
            `).join("");
            
            detailsRow.innerHTML = `
                <td colspan="3">
                    <div class="details-container">
                        <div class="details-title">${group.company_name} - Selected Candidates</div>
                        <ul class="student-list">
                            ${studentListHtml}
                        </ul>
                    </div>
                </td>
            `;
            
            // Click to toggle
            mainRow.addEventListener("click", () => {
                const isOpen = detailsRow.classList.contains("show");
                
                // Close others (optional, but cleaner)
                // document.querySelectorAll(".details-row").forEach(r => r.classList.remove("show"));
                // document.querySelectorAll(".main-row").forEach(r => r.classList.remove("active"));
                
                if (isOpen) {
                    detailsRow.classList.remove("show");
                    mainRow.classList.remove("active");
                } else {
                    detailsRow.classList.add("show");
                    mainRow.classList.add("active");
                }
            });
            
            tableBody.appendChild(mainRow);
            tableBody.appendChild(detailsRow);
        }

    } catch (error) {
        console.error("Error fetching recruitment data:", error);
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--danger);">Failed to load recruitment data.</td></tr>`;
    }
}

// Call on load
document.addEventListener("DOMContentLoaded", () => {
    // 1. Restore year from localStorage or default to 2024 (as per analytics)
    const storedYear = localStorage.getItem("selectedBatchYear") || "2024";
    
    // 2. Set selector value if it exists
    const yearSelector = document.getElementById("batchYearSelector");
    if (yearSelector) {
        yearSelector.value = storedYear;
        yearSelector.addEventListener("change", (e) => {
            const newYear = e.target.value;
            localStorage.setItem("selectedBatchYear", newYear);
            fetchDashboardStats(newYear);
        });
    }
    
    // 3. Initial Fetch
    fetchDashboardStats(storedYear);
    fetchRecruitmentData();
});


document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function(e) {
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

// Inject extra yellow stars for dark mode
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

            const eyeOpen   = btn.querySelector(".eye-open");
            const eyeClosed = btn.querySelector(".eye-closed");

            // If already revealing, reset the timer (user clicked again)
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }

            // Reveal
            input.type = "text";
            eyeOpen.style.display   = "none";
            eyeClosed.style.display = "";

            // Restart pulse animation
            btn.classList.remove("revealing");
            void btn.offsetWidth; // force reflow to restart animation
            btn.classList.add("revealing");

            // Auto-hide after 2 seconds
            hideTimer = setTimeout(() => {
                input.type = "password";
                eyeOpen.style.display   = "";
                eyeClosed.style.display = "none";
                btn.classList.remove("revealing");
                hideTimer = null;
            }, revealDuration);
        });
    });
});

//auth section

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async(e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Close the auth modal
                const authModal = document.getElementById("authModal");
                if (authModal) {
                    authModal.classList.remove("show");
                    setTimeout(() => { authModal.style.display = "none"; }, 400);
                }
                await loadProfile();
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async(e) => {
        e.preventDefault();

        const full_name = document.getElementById("signupName").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const branch = document.getElementById("signupBranch").value;
        const year = document.getElementById("signupYear").value;

        try {
            const response = await fetch("http://127.0.0.1:5000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ full_name, email, password, branch, year })
            });

            const data = await response.json();

            if (response.ok) {
                // Close the auth modal
                const authModal = document.getElementById("authModal");
                if (authModal) {
                    authModal.classList.remove("show");
                    setTimeout(() => { authModal.style.display = "none"; }, 400);
                }
                // Auto-login after signup
                try {
                    const loginResp = await fetch("http://127.0.0.1:5000/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ email, password })
                    });
                    if (loginResp.ok) {
                        await loadProfile();
                    } else {
                        alert("Signup successful! Please log in.");
                    }
                } catch (_) {
                    alert("Signup successful! Please log in.");
                }
            } else {
                alert(data.error || "Signup failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    });
}

async function loadProfile() {
    try {
        const response = await fetch("http://127.0.0.1:5000/profile", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            // Save to localStorage so RBAC works across pages
            localStorage.setItem("user", JSON.stringify(data));

            // Populate profile dropdown fields
            const nameEl    = document.getElementById("profileName");
            const emailEl   = document.getElementById("profileEmail");
            const branchEl  = document.getElementById("profileBranch");
            const yearEl    = document.getElementById("profileYear");
            const avatarEl  = document.getElementById("profileAvatar");
            const logoutBtn = document.getElementById("logoutBtn");

            if (nameEl)   nameEl.textContent   = data.full_name || "—";
            if (emailEl)  emailEl.textContent   = data.email    || "—";
            if (branchEl) branchEl.textContent  = data.branch   || "—";
            if (yearEl)   yearEl.textContent    = data.year     || "—";

            // Set avatar letter WITHOUT wiping the child adminStar span
            if (avatarEl && data.full_name) {
                // Find or create a text node for the initial letter
                let textNode = null;
                for (let node of avatarEl.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) { textNode = node; break; }
                }
                if (textNode) {
                    textNode.textContent = data.full_name.charAt(0).toUpperCase();
                } else {
                    avatarEl.insertBefore(
                        document.createTextNode(data.full_name.charAt(0).toUpperCase()),
                        avatarEl.firstChild
                    );
                }
            }

            // Handle Admin UI Badge & Star
            const adminBadge = document.getElementById("adminBadge");
            const adminStar  = document.getElementById("adminStar");
            if (data.role === 'admin' || data.role === 'tpo') {
                if (adminBadge) adminBadge.style.display = 'inline-block';
                if (adminStar) {
                    adminStar.style.display = 'flex';
                    if (avatarEl) {
                        avatarEl.style.border = '2px solid #111';
                        avatarEl.style.boxShadow = '0 0 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.5)';
                    }
                }
            } else {
                if (adminBadge) adminBadge.style.display = 'none';
                if (adminStar)  adminStar.style.display  = 'none';
                if (avatarEl)  { avatarEl.style.border = 'none'; avatarEl.style.boxShadow = 'none'; }
            }

            // Show logout button
            if (logoutBtn) logoutBtn.style.display = "block";

            // Hide Login / Signup buttons in hamburger nav
            const loginBtn  = document.getElementById("loginBtn");
            const signupBtn = document.getElementById("signupBtn");
            if (loginBtn)  loginBtn.style.display  = "none";
            if (signupBtn) signupBtn.style.display = "none";

            // Load My Applications for students
            if (data.role === 'student') {
                loadMyApplications();
            }
        } else {
            // Not logged in — reset to guest state
            setGuestProfile();
        }
    } catch (error) {
        console.error("Profile error:", error);
        setGuestProfile();
    }
}

function setGuestProfile() {
    localStorage.removeItem("user");
    const nameEl    = document.getElementById("profileName");
    const emailEl   = document.getElementById("profileEmail");
    const branchEl  = document.getElementById("profileBranch");
    const yearEl    = document.getElementById("profileYear");
    const avatarEl  = document.getElementById("profileAvatar");
    const logoutBtn = document.getElementById("logoutBtn");

    if (nameEl)   nameEl.textContent  = "Guest";
    if (emailEl)  emailEl.textContent  = "—";
    if (branchEl) branchEl.textContent = "—";
    if (yearEl)   yearEl.textContent   = "—";
    if (avatarEl) avatarEl.textContent = "?";
    if (logoutBtn) logoutBtn.style.display = "none";

    // Hide applications panel on logout
    const panel = document.getElementById("myApplicationsPanel");
    if (panel) panel.style.display = "none";

    const adminBadge = document.getElementById("adminBadge");
    const adminStar = document.getElementById("adminStar");
    if (adminBadge) adminBadge.style.display = 'none';
    if (adminStar && avatarEl) {
        adminStar.style.display = 'none';
        avatarEl.style.border = 'none';
        avatarEl.style.boxShadow = 'none';
        avatarEl.appendChild(adminStar);
    }

    const loginBtn  = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    if (loginBtn)  loginBtn.style.display  = "";
    if (signupBtn) signupBtn.style.display = "";
}

// Wire up Logout button
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await fetch("http://127.0.0.1:5000/logout", {
                    method: "POST",
                    credentials: "include"
                });
            } catch(_) {}
            setGuestProfile();
            // Close the dropdown
            const profileDropdown = document.getElementById("profileDropdown");
            if (profileDropdown) profileDropdown.classList.remove("show");
        });
    }

    // Restore session on page load
    loadProfile();
});

// ====== My Applications Fetch + Render ======
async function loadMyApplications() {
    const panel = document.getElementById("myApplicationsPanel");
    const list  = document.getElementById("myApplicationsList");
    if (!panel || !list) return;

    panel.style.display = "block";
    list.innerHTML = '<p style="color: #888; font-size: 12px;">Loading...</p>';

    try {
        const res = await fetch("http://127.0.0.1:5000/my-applications", { credentials: "include" });
        if (!res.ok) { list.innerHTML = '<p style="color:#888; font-size:12px;">Could not load applications.</p>'; return; }

        const apps = await res.json();
        if (apps.length === 0) {
            list.innerHTML = '<p style="color:#888; font-size:12px;">No applications yet. Browse companies to apply!</p>';
            return;
        }

        const statusColor = (s) => s === 'applied' ? '#facc15' : s === 'shortlisted' ? '#22c55e' : s === 'rejected' ? '#ef4444' : '#aaa';

        list.innerHTML = apps.map(app => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); border-radius:6px; padding:8px 10px; border: 1px solid rgba(255,255,255,0.07);">
                <div>
                    <div style="font-size:13px; font-weight:600; color:var(--text-main, #fff);">${app.company_name}</div>
                    <div style="font-size:11px; color:#888; margin-top:2px;">${app.role} &bull; ${app.applied_at}</div>
                </div>
                <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; background:${statusColor(app.status)}22; color:${statusColor(app.status)}; border:1px solid ${statusColor(app.status)}44; text-transform:uppercase; letter-spacing:0.5px;">
                    ${app.status}
                </span>
            </div>
        `).join('');
    } catch(_) {
        list.innerHTML = '<p style="color:#888; font-size:12px;">Error loading applications.</p>';
    }
}