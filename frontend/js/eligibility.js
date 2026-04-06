/**
 * eligibility.js - Company Intelligence & Requirements Module
 * Handles dynamic fetching and display of recruitment criteria.
 */

// GLOBAL STATE
let allCompanies = [];
let currentUserProfile = null;

// --- UTILITY: TOAST & LOADER (Global-Aware) ---
function showToast(message, type = "info") {
    if (window.toast) window.toast.show(message, type);
    else console.log(`[TOAST-${type.toUpperCase()}] ${message}`);
}

function showLoader(show) {
    const globalLoader = document.getElementById("loader");
    if (globalLoader) {
        if (show) globalLoader.classList.remove("hidden");
        else globalLoader.classList.add("hidden");
    }
}

// --- 2. FETCH DATA FROM BACKEND (Attached to window for web.js access) ---
window.fetchCompanies = async function() {
    console.log("[ELIGIBILITY] Starting recruitment criteria fetch...");
    try {
        const college = localStorage.getItem("college") || "USAR";
        const batch = localStorage.getItem("selectedBatchYear") || "2025";
        
        const response = await window.api.get(`/companies/eligibility?batch_year=${batch}`);
        if (!response.ok) throw new Error("Backend response not OK");
        
        const result = await response.json();
        let rawCompanies = Array.isArray(result) ? result : (result.data || []);

        // --- Intelligence Readiness Whitelist ---
        const intelligenceReady = [
            "Microsoft", "IndiaMART", "Unthinkable Solutions", "Publicis Sapient",
            "RTDS Pvt Ltd", "AVL", "TensorGo Software", "Genpact", "Infogain", "Amar Ujala",
            "rtCamp Solutions", "GoDaddy", "Corning", "Cvent", "CVent (SRE)", "Zenon", "AB InBev", "Yamaha",
            "Tejas Networks", "Tredence Analytics", "Raro.ai", "Unacademy", "Cubastion Consulting"
        ];

        // Filter and normalize
        allCompanies = rawCompanies.filter(c => {
            const name = c.companyName || c.company || c.company_name;
            return intelligenceReady.includes(name);
        });

        // Dedup: Take latest records
        const uniqueNames = [...new Set(allCompanies.map(c => c.companyName || c.company || c.company_name))].sort();
        allCompanies = uniqueNames.map(name => {
            return allCompanies
                .filter(c => (c.companyName || c.company || c.company_name) === name)
                .sort((a, b) => (b.batch_year || 0) - (a.batch_year || 0))[0];
        });

        console.log(`[DEBUG] Loaded ${allCompanies.length} Intelligence Records`);
        
        // Re-populate dropdown silently
        if (typeof window.populateDropdown === 'function') window.populateDropdown();
        
        return allCompanies;
    } catch (error) {
        console.error("[ELIGIBILITY] Data fetch failed:", error);
        return [];
    }
};

// --- 3. POPULATE DROPDOWN (Global access) ---
window.populateDropdown = function() {
    const companySelect = document.getElementById("companySelect");
    if (!companySelect) return;

    // Reset dropdown preserving the placeholder
    companySelect.innerHTML = '<option value="" style="background: black; color: var(--primary);">SELECT COMPANY TO EXPLORE</option>';

    if (allCompanies.length === 0) {
        console.warn("[ELIGIBILITY] No matching companies found for current batch/college");
        return;
    }

    allCompanies.forEach(company => {
        const name = company.companyName || company.company || company_name;
        const option = document.createElement("option");
        option.value = company.id || company.companyName || company.company || company._id;
        option.textContent = name;

        // Visual consistency
        option.style.backgroundColor = "#000";
        option.style.color = "var(--primary)";
        option.style.padding = "10px";

        companySelect.appendChild(option);
    });

    // Auto-update global matches if profile exists
    if (currentUserProfile && typeof window.evaluateGlobalEligibility === 'function') {
        window.evaluateGlobalEligibility();
    }
}

// --- CORE MODULE LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const skillsForm = document.getElementById("skillsForm");
    const companySelect = document.getElementById("companySelect");
    const companyDetails = document.getElementById("companyDetails");

    async function init() {
        showLoader(true);
        try {
            // Restore profile
            const savedProfile = localStorage.getItem("userEligibilityProfile");
            if (savedProfile) {
                currentUserProfile = JSON.parse(savedProfile);
                populateProfileForm(currentUserProfile);
            }

            // Fetch initial data
            await window.fetchCompanies();
        } catch (e) {
            console.error("[ELIGIBILITY] Initialization error:", e);
        } finally {
            showLoader(false);
        }
    }

    function populateProfileForm(user) {
        ["userName", "userBranch", "userCgpa"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = user[id.replace('user', '').toLowerCase()] || "";
        });
        const skillsEl = document.getElementById("userSkills");
        if (skillsEl) skillsEl.value = (user.skills || []).join(", ");
    }

    // Capture User Data
    if (skillsForm) {
        skillsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const cgpa = parseFloat(document.getElementById("userCgpa").value);
            if (cgpa < 0 || cgpa > 10) return showToast("Invalid CGPA Score", "error");

            const skillsRaw = document.getElementById("userSkills").value;
            const profile = {
                name: document.getElementById("userName").value,
                branch: document.getElementById("userBranch").value,
                cgpa: cgpa,
                skills: skillsRaw.split(",").map(s => s.trim().toLowerCase()).filter(s => s)
            };

            currentUserProfile = profile;
            localStorage.setItem("userEligibilityProfile", JSON.stringify(profile));
            showToast("Success Profile verified! Evaluating matches...", "success");

            window.evaluateGlobalEligibility();

            // Refresh selected company details if visible
            if (companySelect.value) {
                const comp = allCompanies.find(c => String(c.id || c.companyName || c.company || c._id) === String(companySelect.value));
                if (comp) renderCompanyDetails(comp);
            }
        });
    }

    // Selection Handling
    if (companySelect) {
        companySelect.addEventListener("change", (e) => {
            const id = e.target.value;
            if (!id) return renderEmptyState();
            const comp = allCompanies.find(c => String(c.id || c.companyName || c.company || c._id) === String(id));
            if (comp) renderCompanyDetails(comp);
        });
    }

    // Calculation Logic
    window.evaluateGlobalEligibility = function() {
        const resultsContainer = document.getElementById("eligibilityResults");
        if (!currentUserProfile || allCompanies.length === 0) {
            if (resultsContainer) resultsContainer.style.display = "none";
            return;
        }

        const stats = allCompanies.map(c => analyzeMatch(currentUserProfile, c));
        if (resultsContainer) resultsContainer.style.display = "block";

        renderResultsList("eligibleList", stats.filter(s => s.status === 'eligible').sort((a,b) => b.match - a.match));
        renderResultsList("improveList", stats.filter(s => s.status === 'improve').sort((a,b) => b.match - a.match));
        renderResultsList("ineligibleList", stats.filter(s => s.status === 'ineligible'));
    }

    function analyzeMatch(user, comp) {
        const compSkills = getCompSkills(comp).map(s => s.toLowerCase());
        const userSkills = user.skills || [];
        
        // Match percentage
        const matched = userSkills.filter(s => compSkills.includes(s));
        const percent = compSkills.length ? (matched.length / compSkills.length) * 100 : 0;
        const missing = compSkills.filter(s => !userSkills.includes(s));

        // Academic Match
        const minCgpa = parseFloat(String(comp.cgpa || comp.eligibility?.cgpa || 0).match(/(\d+(\.\d+)?)/)?.[0] || 0);
        const cgpaOk = user.cgpa >= minCgpa;
        const branches = String(comp.academics || comp.eligibility?.academics || "All").toLowerCase();
        const branchOk = branches.includes("all") || branches.includes(user.branch.toLowerCase());

        let status = "eligible";
        if (!cgpaOk || !branchOk) status = "ineligible";
        else if (percent < 60) status = "improve";

        return {
            company: comp.companyName || comp.company || comp.company_name,
            role: (comp.roles && comp.roles.length) ? comp.roles[0] : (comp.role || "Technical Role"),
            package: comp.package || "₹TBD",
            match: Math.round(percent),
            missing,
            status,
            reasons: { cgpaOk, branchOk, minCgpa }
        };
    }

    function getCompSkills(c) {
        if (c.skills && typeof c.skills === 'object') return [...(c.skills.core || []), ...(c.skills.programming || []), ...(c.skills.tools || [])];
        return c.required_skills || ["DSA", "System Fundamentals"];
    }

    function renderResultsList(id, data) {
        const el = document.getElementById(id);
        if (!el) return;
        if (!data.length) {
            el.innerHTML = `<div style="padding:12px; opacity:0.3; font-size:12px; text-align:center;">No direct matches</div>`;
            return;
        }
        el.innerHTML = data.map(r => `
            <div class="match-item glass-card" style="padding: 1.2rem; border-left: 3px solid ${r.status === 'eligible' ? '#10b981' : (r.status === 'improve' ? '#f59e0b' : '#ef4444')}; background: rgba(255,255,255,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h4 style="margin: 0; font-size: 14px;">${r.company}</h4>
                    <span style="color: ${r.status === 'eligible' ? '#10b981' : (r.status === 'improve' ? '#f59e0b' : '#ef4444')}; font-weight: 800; font-size: 13px;">${r.match}%</span>
                </div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 8px;">${r.role} &bull; ${r.package}</div>
                ${r.status === 'ineligible' ? `
                    <div style="font-size: 10px; color: #ef4444;">${!r.reasons.cgpaOk ? '❌ Low CGPA' : ''} ${!r.reasons.branchOk ? '❌ Branch Match Failed' : ''}</div>
                ` : `
                    <div style="font-size: 10px; color: rgba(255,255,255,0.2);">${r.missing.length ? 'Gaps: ' + r.missing.join(', ') : 'âœ… Technical Match'}</div>
                `}
            </div>
        `).join('');
    }

    function renderCompanyDetails(c) {
        if (!companyDetails) return;
        companyDetails.style.opacity = "0";
        setTimeout(() => {
            const name = c.companyName || c.company || c.company_name;
            if (c.dataAvailable === false) {
                companyDetails.innerHTML = `<div class="glass-card" style="padding:4rem; text-align:center; border:2px dashed rgba(212,175,55,0.1); border-radius:20px;">
                    <h2 style="color:#fff;">${name}</h2>
                    <p style="color:var(--primary);">Hiring intelligence profile pending verification.</p>
                </div>`;
            } else {
                const pkg = c.package || "₹Market Standard";
                const steps = c.selectionProcess || [];
                const cgpa = c.eligibility?.cgpa || c.cgpa || "No Cutoff";
                const acads = c.eligibility?.academics || c.academics || "All Streams";

                companyDetails.innerHTML = `
                <div class="intelligence-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; animation: slideUp 0.5s ease forwards;">
                    <div class="glass-card main-info-card" style="grid-column:1/-1; display:flex; align-items:center; justify-content:space-between; padding:2rem; border:1px solid rgba(212,175,55,0.2); background: linear-gradient(135deg, rgba(20,20,20,0.8), rgba(0,0,0,0.8));">
                        <div style="display:flex; align-items:center; gap:20px;">
                            <div style="width:70px; height:70px; background:rgba(212,175,55,0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:2rem; color:var(--primary); font-weight:900;">${name[0]}</div>
                            <div>
                                <h1 style="color:#fff; font-size:1.8rem; margin:0;">${name}</h1>
                                <span style="font-size:13px; color:rgba(255,255,255,0.4);">${c.type || 'Engineering Partner'} &bull; ${c.location || 'Multiple Cities'}</span>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:var(--primary); font-size:2.2rem; font-weight:900;">${pkg}</div>
                            <div style="font-size:11px; text-transform:uppercase; opacity:0.3; letter-spacing:1px;">Recruitment Intelligence</div>
                        </div>
                    </div>
                    
                    <div class="glass-card" style="padding:1.5rem; border-left:4px solid #10b981;">
                        <h4 style="color:#10b981; margin-bottom:15px;"><i class="fas fa-graduation-cap"></i> Academic Metrics</h4>
                        <div style="margin-bottom:10px;"><label style="opacity:0.4; font-size:11px; display:block;">CUTOFF</label><strong style="font-size:1.4rem;">${cgpa}</strong></div>
                        <div><label style="opacity:0.4; font-size:11px; display:block;">ELIGIBLE STREAMS</label><p style="font-size:13px;">${acads}</p></div>
                    </div>

                    <div class="glass-card" style="padding:1.5rem; border-left:4px solid var(--primary);">
                        <h4 style="color:var(--primary); margin-bottom:15px;"><i class="fas fa-briefcase"></i> Role Specs</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            ${(c.roles || []).map(r => `<span style="padding:5px 12px; background:rgba(212,175,55,0.05); color:var(--primary); font-size:12px; border-radius:4px; border:1px solid rgba(212,175,55,0.2);">${r}</span>`).join('')}
                        </div>
                        <div style="margin-top:15px; font-size:12px; opacity:0.6;">${c.eligibility?.backlogs || 'No active backlogs permitted.'}</div>
                    </div>

                    <div class="glass-card" style="padding:1.5rem; border-left:4px solid #60a5fa;">
                        <h4 style="color:#60a5fa; margin-bottom:15px;"><i class="fas fa-stream"></i> Selection Pipeline</h4>
                        <div style="display:flex; flex-direction:column; gap:12px; border-left:1px solid rgba(96,165,250,0.2); padding-left:15px;">
                            ${steps.map(s => `<div style="font-size:13px; position:relative;"><span style="position:absolute; left:-19px; width:7px; height:7px; background:#60a5fa; border-radius:50%;"></span>${s}</div>`).join('')}
                        </div>
                    </div>

                    <div class="glass-card" style="padding:1.5rem; border-left:4px solid #fff;">
                        <h4 style="color:#fff; opacity:0.8; margin-bottom:15px;"><i class="fas fa-tools"></i> Required Expertise</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                            ${getCompSkills(c).map(s => `<span style="padding:3px 10px; background:rgba(255,255,255,0.05); font-size:11px; border-radius:4px;">${s}</span>`).join('')}
                        </div>
                        <div style="margin-top:20px; padding:10px; background:rgba(212,175,55,0.05); border-radius:8px; font-size:11px; font-weight:700; color:var(--primary); text-align:center;">Difficulty: ${c.difficulty || 'Professional'}</div>
                    </div>
                </div>`;
            }
            companyDetails.style.opacity = "1";
        }, 300);
    }

    function renderEmptyState() {
        if (!companyDetails) return;
        companyDetails.innerHTML = `<div class="glass-card" style="padding:4rem; text-align:center; opacity:0.5;">
            <div style="font-size:3rem; margin-bottom:1rem;">🏢</div>
            <h3>Discover Hiring Requirements</h3>
            <p>Select a verified brand from the intelligence portal.</p>
        </div>`;
    }

    init();
});
