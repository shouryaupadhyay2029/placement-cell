/**
 * eligibility.js - Company Intelligence & Requirements Module
 * Handles dynamic fetching and display of recruitment criteria.
 */

document.addEventListener("DOMContentLoaded", () => {
    const companySelect = document.getElementById("companySelect");
    const companyDetails = document.getElementById("companyDetails");
    const skillsForm = document.getElementById("skillsForm");

    let allCompanies = [];
    let currentUserProfile = null;

    // --- 1. INITIALIZE PAGE ---
    async function init() {
        showLoader(true);
        try {
            // Load saved profile
            const savedProfile = localStorage.getItem("userEligibilityProfile");
            if (savedProfile) {
                currentUserProfile = JSON.parse(savedProfile);
                populateProfileForm(currentUserProfile);
            }

            await fetchCompanies();
            populateDropdown();

            if (currentUserProfile) evaluateGlobalEligibility();
        } catch (error) {
            console.error("[ELIGIBILITY] Init failed:", error);
            showToast("Failed to load company data.", "error");
        } finally {
            showLoader(false);
        }
    }

    function populateProfileForm(user) {
        if (document.getElementById("userName")) document.getElementById("userName").value = user.name || "";
        if (document.getElementById("userBranch")) document.getElementById("userBranch").value = user.branch || "";
        if (document.getElementById("userCgpa")) document.getElementById("userCgpa").value = user.cgpa || "";
        if (document.getElementById("userSkills")) document.getElementById("userSkills").value = (user.skills || []).join(", ");
    }

    // --- 2. FETCH DATA FROM BACKEND ---
    async function fetchCompanies() {
        try {
            const college = localStorage.getItem("college") || "USAR";
            const batch = localStorage.getItem("year") || "2025";
            const response = await window.api.get(`/companies/eligibility?batch_year=${batch}`);
            const result = await response.json();

            // Standardize format (Backend returns { success: true, data: [...] })
            let rawCompanies = Array.isArray(result) ? result : (result.data || []);

            // --- Updated Intelligence List ---
            const intelligenceReady = [
                "Microsoft", "IndiaMART", "Unthinkable Solutions", "Publicis Sapient",
                "RTDS Pvt Ltd", "AVL", "TensorGo Software", "Genpact", "Infogain", "Amar Ujala",
                "rtCamp Solutions", "GoDaddy"
            ];

            allCompanies = rawCompanies.filter(c =>
                intelligenceReady.includes(c.company || c.company_name)
            );

            // Clean up: Remove duplicates and sort by name
            const uniqueNames = [...new Set(allCompanies.map(c => c.company || c.company_name))].sort();

            // Store unique latest records for each company
            const latestCompanies = uniqueNames.map(name => {
                return allCompanies
                    .filter(c => (c.company || c.company_name) === name)
                    .sort((a, b) => (b.batch_year || 0) - (a.batch_year || 0))[0];
            });

            allCompanies = latestCompanies;
            console.log("[DEBUG] Final Unique Companies List:", allCompanies.map(c => c.company || c.company_name));
            return allCompanies;
        } catch (error) {
            console.error("[ELIGIBILITY] Fetch error:", error);
            throw error;
        }
    }

    // --- 3. POPULATE DROPDOWN ---
    function populateDropdown() {
        if (!companySelect) return;

        // Clear existing except first
        companySelect.innerHTML = '<option value="">SELECT COMPANY TO EXPLORE</option>';

        allCompanies.forEach(company => {
            const option = document.createElement("option");
            option.value = company.id || company._id;
            option.textContent = company.company || company.company_name;

            // Solid opaque black background to prevent translucency overlap
            option.style.backgroundColor = "#000";
            option.style.color = "var(--primary)";
            option.style.padding = "10px";

            companySelect.appendChild(option);
        });
    }

    // --- 4. HANDLE USER DATA CAPTURE ---
    if (skillsForm) {
        skillsForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("userName").value.trim();
            const branch = document.getElementById("userBranch").value.trim();
            const cgpa = parseFloat(document.getElementById("userCgpa").value);
            const skillsRaw = document.getElementById("userSkills").value.trim();

            // Validation
            if (cgpa < 0 || cgpa > 10) {
                showToast("CGPA must be between 0 and 10", "error");
                return;
            }
            if (!skillsRaw) {
                showToast("Please enter at least one skill", "error");
                return;
            }

            const user = {
                name,
                branch,
                cgpa,
                skills: skillsRaw.split(",").map(s => s.trim().toLowerCase()).filter(s => s)
            };

            currentUserProfile = user;
            console.log("👤 User Profile Captured:", user);
            localStorage.setItem("userEligibilityProfile", JSON.stringify(user));

            showToast("Profile updated! Evaluating eligibility...", "success");

            // --- NEW: Run Global Analysis ---
            evaluateGlobalEligibility();

            // If a company is already selected, re-render to potentially show match
            const selectedId = companySelect.value;
            if (selectedId) {
                const company = allCompanies.find(c => (c.id || c._id) === selectedId);
                if (company) renderCompanyDetails(company);
            }
        });
    }

    // --- 5. HANDLE COMPANY SELECTION ---
    if (companySelect) {
        companySelect.addEventListener("change", (e) => {
            const selectedId = e.target.value;
            console.log("[DEBUG] Selected Company ID:", selectedId);
            if (!selectedId) {
                renderEmptyState();
                return;
            }

            const company = allCompanies.find(c => {
                const id = c.id || c._id;
                return String(id) === String(selectedId);
            });

            console.log("[DEBUG] Render Request for:", company ? (company.company || company.company_name) : "NULL");
            if (company) renderCompanyDetails(company);
        });
    }

    // --- 6. ELIGIBILITY MATCHING LOGIC ---
    function getCompanySkills(company) {
        // --- NEW: Map nested skill objects from verified data ---
        if (company.skills && typeof company.skills === 'object') {
            return [
                ...(company.skills.core || []),
                ...(company.skills.programming || []),
                ...(company.skills.tools || [])
            ];
        }

        // Fallback for flat array or roles
        if (company.required_skills) return company.required_skills;
        
        const role = (company.role || "").toLowerCase();
        if (role.includes("sde")) return ["DSA", "Oops", "DBMS", "Java", "Python"];
        return ["DSA", "Oops", "DBMS"];
    }

    function checkEligibility(user, company) {
        const companySkills = getCompanySkills(company).map(s => s.toLowerCase());
        const userSkills = user.skills || [];

        // 1. CGPA Check
        const minCgpa = company.cgpa || company.min_cgpa || 0;
        const cgpaMatch = minCgpa === 0 || (user.cgpa >= minCgpa);

        // 2. Branch Check
        const academics = company.academics || company.allowed_branches || "All";
        const branchMatch = academics.toLowerCase().includes("all") ||
            academics.toLowerCase().includes(user.branch.toLowerCase());

        // 3. Skill Matching
        const matchedSkills = userSkills.filter(s => companySkills.includes(s));
        const matchPercent = companySkills.length > 0 ? (matchedSkills.length / companySkills.length) * 100 : 0;
        const missing = companySkills.filter(s => !userSkills.includes(s));

        // Determine Status
        let status = "eligible";
        if (!cgpaMatch || !branchMatch) status = "ineligible";
        else if (matchPercent < 60) status = "improve";

        return {
            company: company.company || company.company_name,
            role: (company.roles && company.roles.length > 0) ? company.roles[0] : (company.role || "N/A"),
            package: company.package || "₹TBD",
            match: Math.round(matchPercent),
            missing: missing,
            reasons: {
                cgpa: cgpaMatch,
                branch: branchMatch,
                min_cgpa: minCgpa
            },
            status: status
        };
    }

    function evaluateGlobalEligibility() {
        if (!currentUserProfile || !allCompanies.length) return;

        const results = allCompanies.map(c => checkEligibility(currentUserProfile, c));

        // Show results container
        const resultsContainer = document.getElementById("eligibilityResults");
        if (resultsContainer) resultsContainer.style.display = "block";

        renderResultsList("eligibleList", results.filter(r => r.status === "eligible").sort((a, b) => b.match - a.match));
        renderResultsList("improveList", results.filter(r => r.status === "improve").sort((a, b) => b.match - a.match));
        renderResultsList("ineligibleList", results.filter(r => r.status === "ineligible"));
    }

    function renderResultsList(listId, results) {
        const list = document.getElementById(listId);
        if (!list) return;

        if (results.length === 0) {
            list.innerHTML = `<div style="padding: 15px; background: rgba(255,255,255,0.02); border-radius: 10px; color: rgba(255,255,255,0.3); font-size: 13px; text-align: center;">No matches currently</div>`;
            return;
        }

        list.innerHTML = results.map(r => `
            <div class="match-item glass-card" style="padding: 1.2rem; border-left: 3px solid ${r.status === 'eligible' ? '#10b981' : (r.status === 'improve' ? '#f59e0b' : '#ef4444')}; background: rgba(255,255,255,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h4 style="margin: 0; color: #fff; font-size: 15px;">${r.company}</h4>
                    <span style="color: ${r.status === 'eligible' ? '#10b981' : (r.status === 'improve' ? '#f59e0b' : '#ef4444')}; font-weight: 700; font-size: 14px;">${r.match}% Match</span>
                </div>
                <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 8px;">Role: ${r.role} • ${r.package}</div>
                
                ${r.status === 'ineligible' ? `
                    <div style="font-size: 11px; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 5px 10px; border-radius: 5px;">
                        ${!r.reasons.cgpa ? `❌ Low CGPA (Req: ${r.reasons.min_cgpa}) ` : ''}
                        ${!r.reasons.branch ? `❌ Branch Restricted` : ''}
                    </div>
                ` : `
                    <div style="font-size: 11px; color: rgba(255,255,255,0.3);">
                        ${r.missing.length > 0 ? `Missing: <span style="color: #f59e0b;">${r.missing.join(", ")}</span>` : `<span style="color: #10b981;">Perfect skill match!</span>`}
                    </div>
                `}
            </div>
        `).join('');
    }

    // --- 6. UI RENDERING ---
    function renderCompanyDetails(company) {
        if (!companyDetails) return;

        // Start animation
        companyDetails.style.opacity = "0";

        setTimeout(() => {
            const compName = company.company || company.company_name;
            const procSteps = company.selectionProcess || [];
            const skillsObj = company.skills || {};

            companyDetails.innerHTML = `
                <div class="intelligence-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; animation: slideUp 0.5s ease forwards;">
                    
                    <!-- Primary Overview Card -->
                    <div class="glass-card main-info-card" style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; padding: 2rem; border: 1px solid rgba(212, 175, 55, 0.2); background: linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(30,30,30,0.4) 100%);">
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div class="company-logo-placeholder" style="width: 80px; height: 80px; background: rgba(212,175,55,0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--primary); border: 1px solid rgba(212,175,55,0.2);">
                                ${compName[0].toUpperCase()}
                            </div>
                            <div>
                                <h2 style="margin: 0; color: #fff; font-size: 2rem; letter-spacing: 1px;">${compName}</h2>
                                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                                    <span class="status-pill status-active" style="padding: 4px 12px; font-size: 12px;">${company.type || "Premium Partner"}</span>
                                    <span style="color: rgba(255,255,255,0.5); font-size: 14px;"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i> ${company.location || "Multiple Locations"}</span>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: var(--primary); font-size: 2.5rem; font-weight: 800; text-shadow: 0 0 20px rgba(212,175,55,0.3);">${company.package || "₹TBD"}</div>
                            <div style="color: rgba(255,255,255,0.4); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Eligibility Intelligence Profile</div>
                        </div>
                    </div>

                    <!-- Eligibility Card -->
                    <div class="glass-card" style="padding: 1.5rem; border: 1px solid rgba(16, 185, 129, 0.1); background: rgba(16, 185, 129, 0.02);">
                        <h4 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-user-graduate"></i> Academic Threshold
                        </h4>
                        <div class="stat-item" style="margin-bottom: 1.5rem;">
                            <label style="display: block; color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 5px; text-transform: uppercase;">Minimum CGPA</label>
                            <div style="font-size: 1.5rem; color: #fff; font-weight: 600;">${company.cgpa || company.min_cgpa || "0"} <span style="font-size: 14px; color: rgba(255,255,255,0.3); font-weight: 400;">/ 10.0</span></div>
                        </div>
                        <div class="stat-item">
                            <label style="display: block; color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 5px; text-transform: uppercase;">Course Requirement</label>
                            <div style="color: #fff; font-weight: 500; line-height: 1.4; font-size: 13px;">${company.academics || "All Engineering Fields"}</div>
                        </div>
                    </div>

                    <!-- Branches Card -->
                    <div class="glass-card" style="padding: 1.5rem; border: 1px solid rgba(212, 175, 55, 0.1);">
                        <h4 style="color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-code-branch"></i> Roles & Gaps
                        </h4>
                        <div class="branch-tags" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem;">
                            ${(company.roles || []).map(role => `
                                <span style="background: rgba(212,175,55,0.05); color: var(--primary); border: 1px solid rgba(212,175,55,0.2); padding: 5px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;">${role}</span>
                            `).join('') || '<span style="color: rgba(255,255,255,0.3);">Technical Associate</span>'}
                        </div>
                        <div style="margin-top: 1.5rem;">
                            <label style="display: block; color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 5px; text-transform: uppercase;">Backlogs & Notes</label>
                            <div style="color: #fff; font-weight: 500;">${company.backlogs || "No active backlogs"}</div>
                            <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 5px;">* ${company.notes || "Consistent record required"}</div>
                        </div>
                    </div>

                    <!-- Process Card -->
                    <div class="glass-card" style="padding: 1.5rem; border: 1px solid rgba(59, 130, 246, 0.1); background: rgba(59, 130, 246, 0.02); grid-column: span 1;">
                        <h4 style="color: #60a5fa; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-project-diagram"></i> Selection Process
                        </h4>
                        <div class="process-steps" style="position: relative; padding-left: 15px;">
                            ${procSteps.length > 0 ? procSteps.map((step, idx) => `
                                <div style="position: relative; padding-bottom: 10px; margin-bottom: 10px; border-left: 2px solid rgba(59, 130, 246, 0.2); padding-left: 15px;">
                                    <div style="position: absolute; left: -7px; top: 0; width: 12px; height: 12px; background: #60a5fa; border-radius: 50%; box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);"></div>
                                    <span style="color: #fff; font-size: 14px; font-weight: 500;">${step}</span>
                                </div>
                            `).join('') : `<p style="color: rgba(96, 165, 250, 0.5); font-style: italic; font-size: 13px;">No selection process data available</p>`}
                        </div>
                    </div>

                    <!-- Skills Card -->
                    <div class="glass-card" style="padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05); grid-column: span 1;">
                        <h4 style="color: #fff; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; opacity: 0.8;">
                            <i class="fas fa-lightbulb"></i> Critical Skills
                        </h4>
                        <label style="display: block; color: rgba(255,255,255,0.4); font-size: 11px; margin-bottom: 8px; text-transform: uppercase;">Core & Tech</label>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem;">
                            ${getCompanySkills(company).map(skill => {
                                const isMatched = currentUserProfile && currentUserProfile.skills.includes(skill.toLowerCase());
                                return `
                                    <span style="background: ${isMatched ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)'}; 
                                                 color: ${isMatched ? '#10b981' : '#fff'}; 
                                                 border: 1px solid ${isMatched ? '#10b981' : 'transparent'};
                                                 padding: 4px 10px; border-radius: 4px; font-size: 11px; display: flex; align-items: center; gap: 5px;">
                                        ${isMatched ? '<i class="fas fa-check" style="font-size: 10px;"></i>' : ''} ${skill}
                                    </span>
                                `;
                            }).join('')}
                        </div>
                        
                        ${skillsObj.tools && skillsObj.tools.length > 0 ? `
                            <label style="display: block; color: rgba(255,255,255,0.4); font-size: 11px; margin-bottom: 5px; text-transform: uppercase;">Adv. Stack / Tools</label>
                            <div style="color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.5;">${skillsObj.tools.join(", ")}</div>
                        ` : ''}
                        
                        <div style="margin-top: 1rem; padding: 8px; background: rgba(212, 175, 55, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                            <span style="color: var(--primary); font-size: 11px; font-weight: 700;">LEVEL: ${company.difficulty || "Medium"}</span>
                            <span style="color: rgba(255,255,255,0.3); font-size: 10px;">Recruitment Integrity Verified</span>
                        </div>
                    </div>

                </div>
            `;
            companyDetails.style.opacity = "1";
        }, 300);
    }

    function renderEmptyState() {
        if (!companyDetails) return;
        companyDetails.innerHTML = `
            <div class="glass-card" style="padding: 4rem; text-align: center; background: rgba(255,255,255,0.02); border: 1px dashed rgba(212, 175, 55, 0.2); border-radius: 20px;">
                <div style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.5;">🏢</div>
                <h3 style="color: rgba(255,255,255,0.5); font-weight: 500;">Select a company from the dropdown to view details</h3>
                <p style="color: rgba(255,255,255,0.3); font-size: 14px; margin-top: 0.5rem;">Access eligibility, packages, and hiring process insights.</p>
            </div>
        `;
    }

    function showLoader(show) {
        const globalLoader = document.getElementById("loader");
        if (globalLoader) {
            if (show) globalLoader.classList.remove("hidden");
            else globalLoader.classList.add("hidden");
        }
    }

    // Initialize the module
    init();
});
