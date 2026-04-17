/**
 * eligibility.js v4.0 — Wired to Intelligence Engine v4.0
 * Renders real, structured, mentor-grade analysis output.
 */

// ═══════════════════════════════════════════
//  GLOBAL STATE
// ═══════════════════════════════════════════
let allCompanies     = [];
let currentUserProfile = null;
let skillProgress    = {};

// ═══════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════
function showToast(message, type = "info") {
    if (window.toast) window.toast.show(message, type);
    else console.log(`[${type.toUpperCase()}] ${message}`);
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function cycleLoader(messages) {
    const el = document.getElementById("loaderStatus");
    if (!el) return;
    for (const msg of messages) {
        el.textContent = msg;
        await new Promise(r => setTimeout(r, 400));
    }
}

async function showLoader(active, messages = ["INITIALIZING"]) {
    const el = document.getElementById("loader");
    if (!el) return;
    if (active) {
        el.classList.remove("hidden");
        await cycleLoader(messages);
    } else {
        el.classList.add("hidden");
    }
}

// ═══════════════════════════════════════════
//  PROGRESS PERSISTENCE
// ═══════════════════════════════════════════
function loadProgress() {
    try { skillProgress = JSON.parse(localStorage.getItem("spa_progress_v4") || "{}"); }
    catch { skillProgress = {}; }
}

function saveProgress() {
    localStorage.setItem("spa_progress_v4", JSON.stringify(skillProgress));
}

function getProgress(skillId) {
    return skillProgress[skillId] || { status: "not_started", progress: 0, inPlan: false };
}

function markStarted(skillId) {
    skillProgress[skillId] = { ...getProgress(skillId), status: "learning", progress: 25 };
    saveProgress();
}

function togglePlan(skillId) {
    const p = getProgress(skillId);
    skillProgress[skillId] = { ...p, inPlan: !p.inPlan };
    saveProgress();
    return skillProgress[skillId].inPlan;
}

// ═══════════════════════════════════════════
//  COMPANY FETCHING
// ═══════════════════════════════════════════
window.fetchCompanies = async function () {
    try {
        const batch = localStorage.getItem("selectedBatchYear") || "2025";
        const res   = await window.api.get(`/companies/eligibility?batch_year=${batch}`);
        if (!res.ok) throw new Error("fetch failed");
        const result = await res.json();
        let raw = Array.isArray(result) ? result : (result.data || []);

        const allowList = [
            "Microsoft","IndiaMART","Unthinkable Solutions","Publicis Sapient",
            "RTDS Pvt Ltd","AVL","TensorGo Software","Genpact","Infogain","Amar Ujala",
            "rtCamp Solutions","GoDaddy","Corning","Cvent","CVent (SRE)","Zenon",
            "AB InBev","Yamaha","Tejas Networks","Tredence Analytics","Raro.ai",
            "Unacademy","Cubastion Consulting"
        ];

        allCompanies = raw.filter(c => allowList.includes(c.companyName || c.company || c.company_name));

        const unique = [...new Set(allCompanies.map(c => c.companyName || c.company || c.company_name))].sort();
        allCompanies = unique.map(name =>
            allCompanies.filter(c => (c.companyName || c.company || c.company_name) === name)
                .sort((a, b) => (b.batch_year || 0) - (a.batch_year || 0))[0]
        );

        window.populateDropdown?.();
    } catch (error) {
        console.error("Error:", error);
        window.populateDropdown?.(); // will populate empty list gracefully
    }
};

window.populateDropdown = function () {
    const sel = document.getElementById("companySelect");
    if (!sel) return;
    sel.innerHTML = '<option value="">SELECT COMPANY TO EXPLORE</option>';
    allCompanies.forEach(c => {
        const name = c.companyName || c.company || '';
        const opt  = document.createElement("option");
        opt.value  = c.id || c.companyName || c.company || c._id;
        opt.textContent = name;
        sel.appendChild(opt);
    });
};

// ═══════════════════════════════════════════
//  MAIN DOCUMENT LOGIC
// ═══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const form         = document.getElementById("skillsForm");
    const companySelect = document.getElementById("companySelect");
    const companyDetailsEl = document.getElementById("companyDetails");

    loadProgress();

    // ── Init ──────────────────────────────
    async function init() {
        await showLoader(true, ["WAKING UP TALENT ENGINE", "RESTORING YOUR SESSION"]);
        try {
            const saved = localStorage.getItem("userEligibilityProfile");
            if (saved) {
                currentUserProfile = JSON.parse(saved);
                fillForm(currentUserProfile);

                const cached = localStorage.getItem("lastAnalysis_v4");
                if (cached) {
                    const data = JSON.parse(cached);
                    globalAnalysisData = data; // Set global single source of truth
                    renderDashboard(data);
                    show("eligibilityResults");
                    hide("eligibilityEmpty");
                }
            }
            await window.fetchCompanies();
        } catch (e) {
            console.error("[init]", e);
        } finally {
            showLoader(false);
        }
    }

    function fillForm(user) {
        setValue("userName",   user.name   || "");
        setValue("userBranch", user.branch || "");
        setValue("userCgpa",   user.cgpa   || "");
        setValue("userSkills", (user.skills || []).join(", "));
    }

    function setValue(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }

    function show(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; }
    function hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

    // ── Form Submit ───────────────────────
    if (form) {
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const cgpa = parseFloat(document.getElementById("userCgpa").value);
            if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                return showToast("Please enter a valid CGPA between 0 and 10.", "error");
            }

            const skillsRaw = document.getElementById("userSkills").value;
            if (!skillsRaw.trim()) {
                return showToast("Please enter at least one skill.", "error");
            }

            currentUserProfile = {
                name:   document.getElementById("userName").value.trim() || "Candidate",
                branch: document.getElementById("userBranch").value.trim() || "Engineering",
                cgpa,
                skills: skillsRaw.split(",").map(s => s.trim()).filter(Boolean)
            };

            localStorage.setItem("userEligibilityProfile", JSON.stringify(currentUserProfile));
            showToast("Running full intelligence analysis...", "info");
            await window.evaluateGlobalEligibility(true); // Force refetch on direct form submit
            document.getElementById("eligibilityResults")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // ── Company Select ────────────────────
    companySelect?.addEventListener("change", e => {
        const id = e.target.value;
        if (!id) return renderEmptyCompanyState();
        const comp = allCompanies.find(c => String(c.id || c.companyName || c.company || c._id) === id);
        if (comp) renderCompanyDetails(comp);
    });

    // ═══════════════════════════════════════════════════════
    //  ANALYSIS ENGINE CALL
    // ═══════════════════════════════════════════════════════
    let isEvaluating = false;
    let globalAnalysisData = null;

    window.evaluateGlobalEligibility = async function (forceRefresh = false) {
        if (!currentUserProfile) return;
        
        // Prevent concurrent overlapping calls
        if (isEvaluating) return;
        isEvaluating = true;

        // Render from single source of truth if already fetched
        if (!forceRefresh && globalAnalysisData) {
            renderDashboard(globalAnalysisData);
            isEvaluating = false;
            return;
        }

        await showLoader(true, [
            "NORMALIZING SKILL INPUT...",
            "RUNNING GAP DETECTION ENGINE...",
            "ANALYZING MARKET ALIGNMENT...",
            "GENERATING MENTOR INSIGHTS..."
        ]);

        try {
            const res = await window.api.post('/analyze-advanced', {
                skills: currentUserProfile.skills,
                cgpa:   currentUserProfile.cgpa,
                branch: currentUserProfile.branch
            });

            if (!res.ok) throw new Error(`Server responded ${res.status}`);
            const data = await res.json();

            if (!data) {
                console.warn("Skipping analysis: no input data");
                renderFallbackUI();
                return;
            }

            // 1. Log full API response
            console.log("FULL API RESPONSE:", data);

            // 2. Destructure with deep fallback safety mapping both root and wrapped .data structures
            const payload = data?.data || data || {};
            
            if (!payload.success && !data.success) throw new Error(data.message || payload.message || "Analysis failed");

            const safeData = {
                // Map both new 'profile' format and legacy 'strategic' format
                strategic: payload.profile || payload.strategic || {},
                // Map both new 'skills' format and legacy 'strengths' format
                strengths: payload.skills || payload.strengths || [],
                gaps: payload.gaps || {},
                marketInsights: payload.marketInsights || payload.recommendations || [],
                actionPlan: payload.actionPlan || payload.recommendations || [],
                profileType: payload.profile?.profileType || payload.strategic?.profileType || payload.profileType || 'N/A',
                stage: payload.profile?.stage || payload.strategic?.stage || payload.stage || 'beginner',
                _meta: payload._meta || {},
                engineVersion: payload.engineVersion || data.engineVersion || '4.1'
            };

            const meta = safeData._meta;
            const engineV = safeData.engineVersion;

            // Globally store single source of truth
            if (!globalAnalysisData || forceRefresh) {
                globalAnalysisData = safeData;
            }

            // Full pipeline trace safely wrapped
            console.info(`[SPA Engine v${engineV}] Raw input:`, meta.rawInput || 'N/A');
            console.info(`[SPA Engine v${engineV}] Parsed tokens:`, meta.parsedTokens || []);
            console.info('[SPA v4.1] Recognized:', meta.recognizedSkills || []);
            console.info('[SPA v4.1] Unrecognized:', meta.unrecognizedTokens || []);
            console.info('[SPA v4.1] Profile:', safeData.profileType, '| Stage:', safeData.stage);
            console.info('[SPA v4.1] Gaps:', safeData.gaps?.total || Object.keys(safeData.gaps || {}).length || 0);

            localStorage.setItem("lastAnalysis_v4", JSON.stringify(safeData));
            show("eligibilityResults");
            hide("eligibilityEmpty");
            renderDashboard(safeData);

        } catch (error) {
            console.error("Error:", error);
            showToast("Could not reach the analysis engine. Check server and retry.", "error");
            renderFallbackUI();
        } finally {
            showLoader(false);
            isEvaluating = false; // Release lock
        }
    };

    function renderFallbackUI() {
        const elStrategic = document.getElementById("mentorInsight");
        const elStrengths = document.getElementById("mentorStrengths");
        const elMissing = document.getElementById("mentorMissing");
        const elTrends = document.getElementById("mentorTrends");
        const elActionHigh = document.getElementById("mentorHighImpact");
        const elRoadmap = document.getElementById("mentorRoadmap");

        if (elStrategic) {
            elStrategic.innerHTML = `
                <div style="padding:40px 20px; text-align:center; color:rgba(255,255,255,0.4);">
                    <div style="font-size:3rem; margin-bottom:15px; opacity:0.3; color:var(--primary);">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color:#fff; margin-bottom:8px; font-weight:600; font-size:1.2rem;">Analysis Not Available</h3>
                    <p style="font-size:13px; max-width:320px; margin:0 auto; line-height:1.6; color:rgba(255,255,255,0.5);">The intelligence engine is currently unavailable or returned no data. Please adjust your profile and try again.</p>
                </div>
            `;
        }

        // Skeleton cards for Strengths
        if (elStrengths) {
            elStrengths.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; margin-bottom:12px;">
                    <div>
                        <div style="height:14px; width:120px; background:rgba(255,255,255,0.08); border-radius:6px; margin-bottom:8px;"></div>
                        <div style="height:10px; width:60px; background:rgba(255,255,255,0.04); border-radius:10px;"></div>
                    </div>
                    <div style="text-align:right;">
                        <div style="height:12px; width:40px; background:rgba(255,255,255,0.04); border-radius:4px; margin-bottom:6px;"></div>
                    </div>
                </div>
            `.repeat(3);
        }

        // Fallback for Gaps
        if (elMissing) {
            elMissing.innerHTML = `
                <div style="padding:30px; text-align:center; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:14px;">
                    <i class="fas fa-database" style="font-size:2rem; color:rgba(255,255,255,0.1); margin-bottom:15px; display:block;"></i>
                    <div style="color:rgba(255,255,255,0.4); font-size:14px; font-weight:600;">Data loading or unavailable</div>
                    <div style="color:rgba(255,255,255,0.2); font-size:12px; margin-top:5px;">Unable to fetch missing skill requirements.</div>
                </div>
            `;
        }

        // Skeleton for Market Trends
        if (elTrends) {
            elTrends.innerHTML = `
                <div style="padding:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:14px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <div style="height:12px; width:30%; background:rgba(255,255,255,0.08); border-radius:4px;"></div>
                        <div style="height:12px; width:15%; background:rgba(255,255,255,0.05); border-radius:10px;"></div>
                    </div>
                    <div style="height:10px; width:90%; background:rgba(255,255,255,0.04); border-radius:4px; margin-bottom:6px;"></div>
                    <div style="height:10px; width:70%; background:rgba(255,255,255,0.04); border-radius:4px;"></div>
                </div>
            `.repeat(2);
        }

        // Skeleton for Action Plan (High Impact)
        const skeletonAction = `
            <div style="display:flex; gap:14px; padding:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:14px; margin-bottom:12px;">
                <div style="width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.05); flex-shrink:0;"></div>
                <div style="flex:1;">
                    <div style="height:14px; width:40%; background:rgba(255,255,255,0.08); border-radius:4px; margin-bottom:8px;"></div>
                    <div style="height:12px; width:70%; background:rgba(255,255,255,0.04); border-radius:4px; margin-bottom:4px;"></div>
                    <div style="height:12px; width:50%; background:rgba(255,255,255,0.04); border-radius:4px;"></div>
                </div>
            </div>`;

        if (elActionHigh) {
            elActionHigh.innerHTML = skeletonAction.repeat(3);
        }

        // Skeleton for Roadmap
        const skeletonRoadmap = `
            <div style="display:flex; gap:14px; align-items:flex-start; padding-bottom:12px; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.03);">
                <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.05); flex-shrink:0;"></div>
                <div style="flex:1;">
                    <div style="height:12px; width:30%; background:rgba(255,255,255,0.08); border-radius:4px; margin-bottom:6px;"></div>
                    <div style="height:10px; width:80%; background:rgba(255,255,255,0.04); border-radius:4px;"></div>
                </div>
            </div>`;

        if (elRoadmap) {
            elRoadmap.innerHTML = skeletonRoadmap.repeat(4);
        }

        show("eligibilityResults");
        hide("eligibilityEmpty");
    }

    // ═══════════════════════════════════════════════════════
    //  MASTER RENDERER
    // ═══════════════════════════════════════════════════════
    function renderDashboard(d) {
        if (!d) return;

        // DEBUG LOGS (Verifying normalized data is strictly valid before render)
        console.log("PROFILE:", d.strategic);
        console.log("SKILLS:", d.strengths);
        console.log("GAPS:", d.gaps);

        const name = currentUserProfile?.name?.split(' ')[0] || 'Candidate';
        renderStrategicAnalysis(d, name);
        renderStrengths(d.strengths || []);
        renderGaps(d.gaps || {});
        renderMarketInsights(d.marketInsights || []);
        renderActionPlan(d.actionPlan || []);

        const resultsEl = document.getElementById("eligibilityResults");
        if (resultsEl) {
            resultsEl.style.opacity = "0";
            resultsEl.style.transform = "translateY(20px)";
            resultsEl.style.transition = "all 0.65s cubic-bezier(0.23, 1, 0.32, 1)";
            requestAnimationFrame(() => setTimeout(() => {
                resultsEl.style.opacity = "1";
                resultsEl.style.transform = "translateY(0)";
            }, 60));
        }
    }

    // ─────────────────────────────────────────────────────
    //  SECTION 1: STRATEGIC ANALYSIS PANEL
    // ─────────────────────────────────────────────────────
    function renderStrategicAnalysis(d, name) {
        const tagEl = document.getElementById("profileTypeTag");
        if (tagEl) {
            tagEl.textContent  = d.profileType || 'Unknown';
            tagEl.style.color  = 'var(--primary)';
            tagEl.style.borderColor = 'var(--primary)';
        }

        const stageColors = { beginner: '#ef4444', intermediate: '#f59e0b', advanced: '#10b981' };
        const stageColor  = stageColors[d.stage] || '#60a5fa';

        const ins = d.strategic || {};
        const el  = document.getElementById("mentorInsight");
        if (!el) return;

        const totalParsed     = (d._meta?.parsedTokens || []).length;
        const totalRecognized = (d._meta?.recognizedSkills || []).length;
        const unrecognized    = d._meta?.unrecognizedTokens || [];
        const role            = d.role || 'beginner';
        const roleLabels      = { frontend:'Frontend Dev', backend:'Backend Dev', fullstack:'Full-Stack Dev', data:'Data / ML', core:'CS / DSA', beginner:'Beginner' };
        const roleColors      = { frontend:'#f472b6', backend:'#34d399', fullstack:'#60a5fa', data:'#fb923c', core:'#a78bfa', beginner:'#94a3b8' };
        const roleLabel       = roleLabels[role] || role;
        const roleColor       = roleColors[role]  || '#60a5fa';

        const unrecognizedBanner = unrecognized.length > 0 ? `
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:10px; padding:12px 16px; margin-bottom:18px; font-size:12px; color:rgba(255,255,255,0.6);">
                ⚠ <strong style="color:#f59e0b;">${unrecognized.length} skill${unrecognized.length > 1 ? 's' : ''} not recognized:</strong>
                ${unrecognized.map(u => `<code style="background:rgba(255,255,255,0.06); padding:1px 6px; border-radius:4px; font-size:11px;">${esc(u)}</code>`).join(' ')}
            </div>` : '';

        // Make text concise: extract the first powerful sentence if there's a dot.
        const briefFocus = (ins.currentFocus || 'Identifying core strengths.').split('.')[0] + '.';
        const briefGaps = (ins.keyGaps || 'Missing essential skills.').split('.')[0] + '.';
        const briefImpact = (ins.impact || 'Limits current placement limits.').split('.')[0] + '.';

        el.innerHTML = `
            ${unrecognizedBanner}

            <!-- 1. HIERARCHY: Label, Big Heading, Subtext -->
            <div style="margin-bottom: 2.5rem; text-align: left;">
                <div style="display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border-radius:30px; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); color:var(--primary); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; margin-bottom:1rem; box-shadow: 0 0 10px rgba(212,175,55,0.1);">
                    <i class="fas fa-brain"></i> AI STRATEGIC ANALYSIS
                </div>
                
                <h1 style="font-size: 2.2rem; font-weight: 900; color: #fff; line-height: 1.25; margin: 0 0 1rem 0; letter-spacing: -0.5px; text-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    ${esc(ins.summary || 'Profile Analysis Pending')}
                </h1>
                
                <p style="font-size: 15px; color: rgba(255,255,255,0.6); max-width: 800px; line-height: 1.6; margin: 0; font-weight: 400;">
                    Based on your skill matrix, here is the projected roadmap to align with top tech requirements.
                </p>
                
                <div style="display:flex; align-items:center; gap:10px; margin-top:1.5rem; flex-wrap:wrap;">
                    <span style="font-size:10px; font-weight:800; padding:6px 14px; border-radius:20px; background:${stageColor}22; color:${stageColor}; border:1px solid ${stageColor}55; text-transform:uppercase; letter-spacing:1.5px; box-shadow: 0 0 8px ${stageColor}22;">${esc(d.stage || 'beginner')} stage</span>
                    <span style="font-size:10px; font-weight:800; padding:6px 14px; border-radius:20px; background:${roleColor}18; color:${roleColor}; border:1px solid ${roleColor}44; text-transform:uppercase; letter-spacing:1.5px; box-shadow: 0 0 8px ${roleColor}22;">🎯 ${esc(roleLabel)}</span>
                </div>
            </div>

            <style>
                .hero-insight-card {
                    background: rgba(10, 10, 10, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 1.8rem;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    position: relative;
                    z-index: 1;
                    backdrop-filter: blur(10px);
                }
                .hero-insight-card:hover {
                    transform: translateY(-4px);
                    background: rgba(20, 20, 20, 0.6);
                }
                .card-focus:hover { border-color: rgba(212,175,55,0.7); box-shadow: 0 15px 35px rgba(0,0,0,0.4), 0 0 15px rgba(212,175,55,0.3), inset 0 0 15px rgba(212,175,55,0.1); }
                .card-gaps:hover { border-color: rgba(239,68,68,0.7); box-shadow: 0 15px 35px rgba(0,0,0,0.4), 0 0 15px rgba(239,68,68,0.3), inset 0 0 15px rgba(239,68,68,0.1); }
                .card-impact:hover { border-color: rgba(16,185,129,0.7); box-shadow: 0 15px 35px rgba(0,0,0,0.4), 0 0 15px rgba(16,185,129,0.3), inset 0 0 15px rgba(16,185,129,0.1); }
                
                .hero-insight-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    margin-bottom: 1.2rem;
                }
            </style>

            <!-- 2. THREE CARDS GRID -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
                
                <div class="hero-insight-card card-focus">
                    <div class="hero-insight-icon" style="background: rgba(212,175,55,0.1); color: var(--primary);">
                        <i class="fas fa-crosshairs"></i>
                    </div>
                    <div style="font-size:11px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:2px; margin-bottom:0.8rem;">Current Focus</div>
                    <div style="font-size:14px; color:rgba(255,255,255,0.85); line-height:1.6; font-weight:500;">
                        ${esc(briefFocus)}
                    </div>
                </div>

                <div class="hero-insight-card card-gaps">
                    <div class="hero-insight-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div style="font-size:11px; font-weight:800; color:#ef4444; text-transform:uppercase; letter-spacing:2px; margin-bottom:0.8rem;">Key Gaps</div>
                    <div style="font-size:14px; color:rgba(255,255,255,0.85); line-height:1.6; font-weight:500;">
                        ${esc(briefGaps)}
                    </div>
                </div>

                <div class="hero-insight-card card-impact">
                    <div class="hero-insight-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div style="font-size:11px; font-weight:800; color:#10b981; text-transform:uppercase; letter-spacing:2px; margin-bottom:0.8rem;">Impact on Placements</div>
                    <div style="font-size:14px; color:rgba(255,255,255,0.85); line-height:1.6; font-weight:500;">
                        ${esc(briefImpact)}
                    </div>
                </div>

            </div>

            <!-- Next Logical Step (Footer) -->
            <div style="background: linear-gradient(90deg, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0.5) 100%); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 20px 24px; display: flex; align-items: center; gap: 20px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--primary);"></div>
                <div style="width: 44px; height: 44px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 20px rgba(212,175,55,0.4);">
                    <i class="fas fa-chevron-right" style="color: #000; font-size: 1.2rem;"></i>
                </div>
                <div>
                    <div style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:2px; margin-bottom:6px;">Next Logical Step</div>
                    <div style="font-size:15px; color:#fff; font-weight:700; max-width: 90%;">
                        ${esc(ins.nextStep || 'Review the skill gap engine below.')}
                    </div>
                </div>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────
    //  SECTION 2: VERIFIED STRENGTHS
    // ─────────────────────────────────────────────────────
    function renderStrengths(strengths) {
        const el = document.getElementById("mentorStrengths");
        if (!el) return;

        if (!strengths.length) {
            el.innerHTML = `<div style="padding:20px; text-align:center; color:rgba(255,255,255,0.25); font-size:13px; font-style:italic;">
                No data available yet
            </div>`;
            return;
        }

        const domainColors = {
            core_fundamentals: '#a78bfa',
            languages: '#60a5fa',
            frontend: '#f472b6',
            backend: '#34d399',
            data: '#fb923c',
            tools: '#94a3b8',
            devops: '#22d3ee'
        };

        el.innerHTML = strengths.map(s => {
            const rawCategory = (s.capabilities && s.capabilities[0]) ? s.capabilities[0] : (s.category || 'Core Skill');
            const cMatch = rawCategory.toLowerCase().replace(/\s+/g, '_');
            const color = domainColors[cMatch] || '#10b981';
            
            return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:rgba(16,185,129,0.03); border:1px solid rgba(16,185,129,0.12); border-radius:12px;">
                    <div>
                        <div style="font-weight:700; font-size:14px; color:#fff; margin-bottom:3px;">${esc(s.name || s.id || 'Unknown Skill')}</div>
                        <span style="font-size:10px; padding:2px 8px; border-radius:20px; background:${color}15; color:${color}; border:1px solid ${color}33; text-transform:uppercase; letter-spacing:1px;">${esc(rawCategory)}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:12px; color:#10b981; font-weight:700; margin-bottom:2px;">Industry Verified</div>
                        <i class="fas fa-check-circle" style="color:#10b981; font-size:1.1rem;"></i>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ─────────────────────────────────────────────────────
    //  SECTION 3: GAP ENGINE — EXPANDABLE PRIORITY CARDS
    // ─────────────────────────────────────────────────────
    function renderGaps(gaps) {
        const el = document.getElementById("mentorMissing");
        if (!el) return;

        if (!document.getElementById('gap-styles')) {
            const style = document.createElement('style');
            style.id = 'gap-styles';
            style.innerHTML = `
                @keyframes loadProgress {
                    0% { width: 0; opacity: 0; }
                    100% { opacity: 1; }
                }
                .gap-card-premium:hover {
                    box-shadow: 0 15px 40px rgba(0,0,0,0.5);
                    transform: translateY(-2px);
                }
                .gap-card-premium:hover .skill-card-header {
                    background: rgba(255,255,255,0.02);
                }
            `;
            document.head.appendChild(style);
        }

        const PRIORITY_CONFIG = {
            CRITICAL: { label: "CRITICAL",     color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.4)", icon: "🚨" },
            HIGH:     { label: "HIGH PRIORITY",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)", icon: "⚠️" },
            OPTIONAL: { label: "OPTIONAL",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.4)", icon: "💡" }
        };

        const isArray = Array.isArray(gaps);

        const sections = [
            { 
                key: 'critical', 
                items: isArray ? gaps.filter(g => g.priority === 'HIGH' || g.priority === 'CRITICAL') : (gaps.critical || []), 
                cfg: PRIORITY_CONFIG.CRITICAL 
            },
            { 
                key: 'high',     
                items: isArray ? gaps.filter(g => g.priority === 'MEDIUM') : (gaps.high || []), 
                cfg: PRIORITY_CONFIG.HIGH 
            },
            { 
                key: 'optional',   
                items: isArray ? gaps.filter(g => g.priority === 'LOW') : (gaps.medium || gaps.low || []), 
                cfg: PRIORITY_CONFIG.OPTIONAL 
            }
        ].filter(s => s.items.length > 0);

        if (!sections.length) {
            el.innerHTML = `<div style="padding:24px; text-align:center; color:rgba(255,255,255,0.3); font-size:13px; font-style:italic;">
                Analysis will appear after data is loaded
            </div>`;
            return;
        }

        let html = '';
        sections.forEach(({ items, cfg }) => {
            html += `
                <div style="margin-bottom:2.5rem;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:1.5rem;">
                        <span style="font-size:1.4rem; filter: drop-shadow(0 0 8px ${cfg.color}44);">${cfg.icon}</span>
                        <span style="font-size:12px; font-weight:900; color:${cfg.color}; text-transform:uppercase; letter-spacing:2px; text-shadow: 0 0 10px ${cfg.color}44;">${cfg.label} GAPS</span>
                        <div style="flex:1; height:1px; background:linear-gradient(90deg, ${cfg.border}, transparent);"></div>
                        <span style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:20px;">${items.length} skill${items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0;">
                        ${items.map(skill => buildSkillCard(skill, cfg)).join('')}
                    </div>
                </div>
            `;
        });

        el.innerHTML = html;

    }

    function buildSkillCard(skill, cfg) {
        const sp        = getProgress(skill.id);
        const inPlan    = sp.inPlan;
        const progress  = sp.progress || 0;
        const diffColors = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
        const dColor     = diffColors[skill.difficulty] || '#60a5fa';

        const demand = skill.demandScore || 0;

        let currentStageIdx = 0; 
        if (progress >= 33) currentStageIdx = 1;
        if (progress >= 66) currentStageIdx = 2;

        const roadmapStageHtml = (lvl, steps, color, isActive, isPast) => `
            <div style="flex: 1; flex-basis: 0; background:rgba(${isActive ? '255,255,255' : '0,0,0'}, ${isActive ? '0.05' : '0.2'}); border-radius:12px; padding:16px; border:1px solid ${isActive ? color : 'rgba(255,255,255,0.05)'}; position:relative; opacity:${isActive || isPast ? '1' : '0.5'}; transition:all 0.3s ease;">
                ${isActive ? `<div style="position:absolute; top:-10px; right:-10px; width:24px; height:24px; border-radius:50%; background:${color}; color:#000; display:flex; align-items:center; justify-content:center; font-size:10px; box-shadow:0 0 10px ${color};"><i class="fas fa-crosshairs"></i></div>` : ''}
                ${isPast ? `<div style="position:absolute; top:-10px; right:-10px; width:24px; height:24px; border-radius:50%; border:1px solid ${color}; background:#1a1a1a; color:${color}; display:flex; align-items:center; justify-content:center; font-size:10px;"><i class="fas fa-check"></i></div>` : ''}
                <div style="font-size:10px; font-weight:900; color:${color}; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
                    <div style="width:6px; height:6px; border-radius:50%; background:${color}; box-shadow:0 0 5px ${color};"></div>
                    ${lvl}
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                    ${(steps || []).map(s => `<span style="font-size:11px; font-weight:600; color:${isPast || isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}; background:rgba(255,255,255,0.08); padding:5px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">${esc(s)}</span>`).join('')}
                </div>
            </div>
        `;

        return `
        <div class="skill-card gap-card-premium" data-id="${skill.id}" style="border:1px solid rgba(255,255,255,0.07); border-radius:18px; margin-bottom:1.2rem; overflow:hidden; background:linear-gradient(180deg, rgba(20,20,20,0.9), rgba(10,10,10,0.95)); transition:all 0.3s ease; position:relative;">
            
            <!-- Subtle gradient border overlay based on priority -->
            <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, transparent, ${cfg.color}, transparent); opacity:0.8;"></div>

            <!-- HEADER -->
            <div class="skill-card-header" data-border-color="${cfg.color}" style="padding:24px; cursor:pointer; user-select:none; position:relative; z-index:1;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
                            <h3 style="color:#fff; font-size:1.3rem; margin:0; font-weight:800; letter-spacing:-0.5px;">${esc(skill.name)}</h3>
                            <span style="font-size:9px; padding:4px 12px; border-radius:30px; background:${cfg.bg}; color:${cfg.color}; border:1px solid ${cfg.border}; font-weight:900; text-transform:uppercase; letter-spacing:1.5px; box-shadow: 0 0 10px ${cfg.bg};">${cfg.label}</span>
                            ${inPlan ? `<span style="font-size:9px; padding:4px 10px; border-radius:20px; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-weight:800;">✓ IN PLAN</span>` : ''}
                        </div>
                        
                        <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:16px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <div style="width:8px; height:8px; border-radius:50%; background:${dColor}; box-shadow: 0 0 8px ${dColor};"></div>
                                <span style="font-size:12px; color:rgba(255,255,255,0.7); font-weight:600;">${esc(skill.difficulty || 'Analysis Pending')}</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <i class="fas fa-chart-line" style="color:rgba(255,255,255,0.4); font-size:12px;"></i>
                                <span style="font-size:12px; color:rgba(255,255,255,0.7); font-weight:600;">${demand}% Demand</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <i class="fas fa-clock" style="color:rgba(255,255,255,0.4); font-size:12px;"></i>
                                <span style="font-size:12px; color:rgba(255,255,255,0.7); font-weight:600;">~${skill.estimatedWeeks || 'TBD'} weeks</span>
                            </div>
                        </div>

                        <!-- Progress Bar (Demand / Mastery) -->
                        <div style="max-width: 90%;">
                           <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                               <span style="font-size:10px; color:rgba(255,255,255,0.4); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">Importance / Market Demand</span>
                           </div>
                           <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; position:relative; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);">
                               <div style="height:100%; width:${demand}%; background:linear-gradient(90deg, ${cfg.color}44, ${cfg.color}); border-radius:3px; animation: loadProgress 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; box-shadow: 0 0 10px ${cfg.color};"></div>
                           </div>
                        </div>

                        ${progress > 0 ? `
                        <div style="margin-top:12px; max-width: 90%;">
                            <div style="height:4px; background:rgba(167,139,250,0.1); border-radius:2px;">
                                <div id="pbar-${skill.id}" style="height:100%; width:${progress}%; background:#a78bfa; border-radius:2px; transition:width 0.5s ease;"></div>
                            </div>
                            <div style="font-size:10px; color:#a78bfa; margin-top:4px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Your Progress: ${progress}%</div>
                        </div>` : `<div id="pbar-wrap-${skill.id}"></div>`}
                    </div>
                    <div style="width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; margin-left:20px; flex-shrink:0; border:1px solid rgba(255,255,255,0.05);">
                        <i class="fas fa-chevron-down chev" style="color:rgba(255,255,255,0.5); transition:transform 0.3s ease; font-size:1rem;"></i>
                    </div>
                </div>
            </div>

            <!-- BODY (Collapsed by default, Expandable on Click) -->
            <div class="skill-card-body" style="display:none; border-top:1px dashed rgba(255,255,255,0.08); background:rgba(0,0,0,0.4);">
                <div style="padding:24px;">

                    <!-- Expandable Grid -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:24px;">
                        
                        <!-- Mentor Analysis -->
                        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:14px; padding:20px;">
                            <div style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-brain"></i> Mentor Analysis
                            </div>
                            <p style="font-size:13.5px; color:rgba(255,255,255,0.8); line-height:1.7; margin:0; font-weight:400;">
                                ${esc(skill.reasoning || skill.whyItMatters || 'Core fundamental required for this role.')}
                            </p>
                        </div>

                        <!-- Why it Matters / Impact if Ignored -->
                        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:14px; padding:20px;">
                            ${skill.whyItMatters ? `
                            <div style="font-size:10px; font-weight:800; color:#60a5fa; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-lightbulb"></i> Why it Matters
                            </div>
                            <p style="font-size:13.5px; color:rgba(255,255,255,0.7); line-height:1.6; margin:0 0 16px 0;">
                                ${esc(skill.whyItMatters)}
                            </p>` : ''}
                            
                            <div style="font-size:10px; font-weight:800; color:#ef4444; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-exclamation-circle"></i> If Ignored
                            </div>
                            <p style="font-size:13.5px; color:rgba(239,68,68,0.9); line-height:1.6; margin:0; font-weight:500;">
                                ${esc(skill.impactIfIgnored || 'Could result in severe rejection rates in technical rounds.')}
                            </p>
                        </div>
                    </div>

                    <!-- Visual Learning Journey -->
                    ${skill.roadmap ? `
                    <div style="margin-bottom:24px;">
                        <div style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                            <i class="fas fa-route"></i> Learning Journey
                        </div>
                        <div style="display:flex; align-items:stretch; gap:12px;">
                            ${roadmapStageHtml('Beginner', skill.roadmap.beginner, '#10b981', currentStageIdx === 0, currentStageIdx > 0)}
                            <div style="display:flex; align-items:center; color:rgba(255,255,255,0.2);"><i class="fas fa-arrow-right"></i></div>
                            ${roadmapStageHtml('Intermediate', skill.roadmap.intermediate, '#f59e0b', currentStageIdx === 1, currentStageIdx > 1)}
                            <div style="display:flex; align-items:center; color:rgba(255,255,255,0.2);"><i class="fas fa-arrow-right"></i></div>
                            ${roadmapStageHtml('Advanced', skill.roadmap.advanced, '#a78bfa', currentStageIdx === 2, currentStageIdx > 2)}
                        </div>
                    </div>` : ''}

                    <!-- Action Buttons -->
                    <div style="display:flex; gap:12px; flex-wrap:wrap;">
                        <a href="${skill.links?.theory || '#'}" target="_blank"
                           data-action="learn" data-skill-id="${skill.id}" data-url="${skill.links?.theory || '#'}"
                           style="display:inline-flex; align-items:center; gap:10px; padding:12px 24px; background:rgba(47,141,70,0.15); border:1px solid rgba(47,141,70,0.3); color:#4ade80; border-radius:12px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px; text-decoration:none; transition:all 0.2s;">
                            <i class="fas fa-book-open"></i> Start Learning
                        </a>
                        <a href="${skill.links?.practice || '#'}" target="_blank"
                           style="display:inline-flex; align-items:center; gap:10px; padding:12px 24px; background:rgba(255,161,22,0.12); border:1px solid rgba(255,161,22,0.3); color:#FFA116; border-radius:12px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px; text-decoration:none; transition:all 0.2s;">
                            <i class="fas fa-laptop-code"></i> Practice Now
                        </a>
                        <button data-action="plan" data-skill-id="${skill.id}"
                            style="display:inline-flex; align-items:center; gap:10px; padding:12px 24px; background:rgba(255,255,255,0.03); border:1px solid ${inPlan ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}; color:${inPlan ? '#10b981' : 'rgba(255,255,255,0.6)'}; border-radius:12px; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px; cursor:pointer; font-family:inherit; transition:all 0.2s;">
                            ${inPlan ? '✓ In Plan' : '+ Add to Plan'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
        `;
    }

    function refreshProgressInCard(skillId) {
        const sp   = getProgress(skillId);
        const wrap = document.getElementById(`pbar-wrap-${skillId}`);
        if (wrap && sp.progress > 0) {
            wrap.innerHTML = `
                <div style="margin-top:6px;">
                    <div style="height:2px; background:rgba(167,139,250,0.1); border-radius:2px;">
                        <div style="height:100%; width:${sp.progress}%; background:#a78bfa; border-radius:2px;"></div>
                    </div>
                    <div style="font-size:10px; color:#a78bfa; margin-top:3px;">Progress: ${sp.progress}%</div>
                </div>`;
        }
    }

    // ─────────────────────────────────────────────────────
    //  SECTION 4: MARKET INSIGHTS  —  Decision Insight Cards
    // ─────────────────────────────────────────────────────
    function renderMarketInsights(insights) {
        const el = document.getElementById("mentorTrends");
        if (!el) return;

        // Inject styles once
        if (!document.getElementById('market-card-styles')) {
            const s = document.createElement('style');
            s.id = 'market-card-styles';
            s.innerHTML = `
                .market-insight-card {
                    transition: all 0.28s ease;
                    cursor: default;
                }
                .market-insight-card:hover {
                    transform: translateY(-4px);
                }
                @keyframes mktFadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
            `;
            document.head.appendChild(s);
        }

        if (!insights.length) {
            el.innerHTML = `
                <div style="padding:40px; text-align:center; color:rgba(255,255,255,0.2); font-size:13px; font-style:italic;">
                    Market intelligence will appear after analysis is complete.
                </div>`;
            return;
        }

        // Normalise status → readiness tier
        const STATUS_MAP = {
            'ready':           { label: 'READY',            color: '#10b981', icon: 'fa-circle-check'   },
            'partially ready': { label: 'PARTIALLY READY',  color: '#f59e0b', icon: 'fa-circle-half-stroke' },
            'partially_ready': { label: 'PARTIALLY READY',  color: '#f59e0b', icon: 'fa-circle-half-stroke' },
            'not ready':       { label: 'NOT READY',        color: '#ef4444', icon: 'fa-circle-xmark'   },
            'not_ready':       { label: 'NOT READY',        color: '#ef4444', icon: 'fa-circle-xmark'   },
        };

        // Segment → icon
        const SEGMENT_ICONS = {
            'product':  'fa-cube',
            'service':  'fa-server',
            'startup':  'fa-rocket',
            'startups': 'fa-rocket',
            'mnc':      'fa-building',
            'banking':  'fa-landmark',
            'fintech':  'fa-coins',
            'default':  'fa-chart-bar',
        };

        function getSegmentIcon(segment) {
            const key = (segment || '').toLowerCase().split(' ')[0];
            return SEGMENT_ICONS[key] || SEGMENT_ICONS['default'];
        }

        function getTier(ins) {
            const rawStatus = (ins.status || '').toLowerCase().trim();
            const rawColor  = (ins.statusColor || '').toLowerCase();

            if (STATUS_MAP[rawStatus]) return STATUS_MAP[rawStatus];

            // Fallback on color hints the backend might send
            if (rawColor.includes('10b981') || rawColor.includes('green'))
                return STATUS_MAP['ready'];
            if (rawColor.includes('f59e0b') || rawColor.includes('amber') || rawColor.includes('yellow'))
                return STATUS_MAP['partially ready'];
            if (rawColor.includes('ef4444') || rawColor.includes('red'))
                return STATUS_MAP['not ready'];

            return { label: esc(ins.status || 'UNKNOWN'), color: '#60a5fa', icon: 'fa-circle-info' };
        }

        el.innerHTML = insights.map((ins, i) => {
            const tier        = getTier(ins);
            const segIcon     = getSegmentIcon(ins.segment);
            const c           = tier.color;
            const insightText = esc((ins.insight || '').split('.').slice(0, 2).join('.').trim() + (ins.insight && ins.insight.split('.').length > 2 ? '.' : ''));

            return `
            <div class="market-insight-card"
                 style="position:relative; padding:22px 24px;
                        background: linear-gradient(135deg, rgba(255,255,255,0.025), rgba(0,0,0,0.3));
                        border:1px solid ${c}33;
                        border-radius:16px; overflow:hidden;
                        box-shadow: 0 0 0 0 ${c}00;
                        animation: mktFadeIn 0.4s ease ${i * 0.1}s both;
                        --glowc: ${c};">
                <!-- Top accent bar -->
                <div style="position:absolute; top:0; left:0; right:0; height:2px;
                            background:linear-gradient(90deg, transparent, ${c}, transparent); opacity:0.9;"></div>
                <!-- Faint bg glow -->
                <div style="position:absolute; top:-30px; right:-30px; width:100px; height:100px;
                            border-radius:50%; background:${c}; filter:blur(50px); opacity:0.07; pointer-events:none;"></div>

                <!-- Header row -->
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <!-- Category icon -->
                        <div style="width:40px; height:40px; border-radius:10px;
                                    background:${c}15; border:1px solid ${c}33;
                                    display:flex; align-items:center; justify-content:center;
                                    box-shadow: 0 0 12px ${c}22;">
                            <i class="fas ${segIcon}" style="color:${c}; font-size:1rem;"></i>
                        </div>
                        <!-- Segment name -->
                        <div>
                            <div style="font-size:14px; font-weight:800; color:#fff; letter-spacing:-0.2px;">
                                ${esc(ins.segment || 'Market Segment')}
                            </div>
                            <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px; margin-top:1px;">
                                Market Segment
                            </div>
                        </div>
                    </div>

                    <!-- Status badge -->
                    <div style="display:flex; align-items:center; gap:6px;
                                padding:6px 14px; border-radius:30px;
                                background:${c}15; border:1px solid ${c}44;
                                box-shadow: 0 0 10px ${c}22;">
                        <i class="fas ${tier.icon}" style="color:${c}; font-size:11px;"></i>
                        <span style="font-size:9px; font-weight:900; color:${c};
                                     text-transform:uppercase; letter-spacing:1.5px; white-space:nowrap;">
                            ${tier.label}
                        </span>
                    </div>
                </div>

                <!-- Insight text -->
                <p style="font-size:13px; color:rgba(255,255,255,0.65); margin:0;
                           line-height:1.65; font-weight:400; max-width:95%;">
                    ${insightText || esc(ins.insight || 'No insight available.')}
                </p>

                <!-- Bottom readiness bar -->
                <div style="margin-top:16px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px; font-weight:700;">
                            Readiness signal
                        </span>
                        <span style="font-size:10px; color:${c}; font-weight:800;">
                            ${tier.label === 'READY' ? '100%' : tier.label === 'PARTIALLY READY' ? '55%' : '20%'}
                        </span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                        <div style="height:100%; width:${tier.label === 'READY' ? '100' : tier.label === 'PARTIALLY READY' ? '55' : '20'}%;
                                    background:linear-gradient(90deg, ${c}66, ${c});
                                    border-radius:2px;
                                    animation: loadProgress 1.2s cubic-bezier(0.1,0.8,0.3,1) forwards;
                                    box-shadow: 0 0 8px ${c};"></div>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Apply hover glow via JS (can't use CSS custom props in box-shadow directly in all browsers)
        el.querySelectorAll('.market-insight-card').forEach(card => {
            const glowColor = getComputedStyle(card).getPropertyValue('--glowc').trim() || '#60a5fa';
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = `0 8px 32px ${glowColor}33, 0 0 0 1px ${glowColor}44`;
                card.style.borderColor = `${glowColor}66`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
                card.style.borderColor = `${glowColor}33`;
            });
        });
    }

    // ─────────────────────────────────────────────────────
    //  SECTION 5: ACTION PLAN  —  Premium Execution Cards
    // ─────────────────────────────────────────────────────
    function renderActionPlan(plan) {
        const highEl    = document.getElementById("mentorHighImpact");
        const roadmapEl = document.getElementById("mentorRoadmap");

        // Inject styles once
        if (!document.getElementById('week-card-styles')) {
            const s = document.createElement('style');
            s.id = 'week-card-styles';
            s.innerHTML = `
                .week-exec-card { transition: all 0.25s ease; }
                .week-exec-card:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(0,0,0,0.5); }
                .week-check-btn { cursor:pointer; border:none; background:none; padding:0; transition: transform 0.15s ease; }
                .week-check-btn:hover { transform: scale(1.15); }
                .week-cta-link { transition: all 0.2s ease; }
                .week-cta-link:hover { filter: brightness(1.2); transform: translateY(-1px); }
                @keyframes weekFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
            `;
            document.head.appendChild(s);
        }

        const WEEK_COLORS = ['#D4AF37','#a78bfa','#60a5fa','#10b981','#f59e0b','#ec4899'];

        // ── helper: build a single week card ──────────────
        function buildWeekCard(w, i, isCompact) {
            const color   = WEEK_COLORS[i % WEEK_COLORS.length];
            const label   = `W${i + 1}`;
            const skill   = esc(w.skill || 'Not available');
            const goal    = esc(w.goal  || 'Not available');
            const time    = esc(w.dailyCommitment || '—');
            const target  = esc(w.milestone || '—');
            const savedKey = `weekDone_${i}`;
            const done    = localStorage.getItem(savedKey) === '1';

            if (isCompact) {
                // ── compact version for "High Impact" slot (4 cards) ──
                return `
                <div class="week-exec-card" data-week-idx="${i}"
                     style="display:flex; gap:16px; align-items:flex-start; padding:18px 20px;
                            background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06);
                            border-left:3px solid ${color}; border-radius:16px;
                            animation: weekFadeIn 0.4s ease ${i * 0.07}s both;
                            opacity: ${done ? '0.55' : '1'};">
                    <!-- Week badge -->
                    <div style="flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <div style="width:40px; height:40px; border-radius:10px;
                                    background:${color}18; border:1px solid ${color}44;
                                    display:flex; align-items:center; justify-content:center;
                                    font-size:12px; font-weight:900; color:${color};">${label}</div>
                        <!-- Checkbox -->
                        <button class="week-check-btn" data-week-key="${savedKey}"
                                title="${done ? 'Mark incomplete' : 'Mark complete'}"
                                onclick="(function(btn){
                                    const k=btn.getAttribute('data-week-key');
                                    const isDone = localStorage.getItem(k)==='1';
                                    localStorage.setItem(k, isDone?'0':'1');
                                    const card = btn.closest('.week-exec-card');
                                    card.style.opacity = isDone ? '1' : '0.55';
                                    btn.innerHTML = isDone
                                        ? '<i class=\\'fas fa-circle\\' style=\\'color:rgba(255,255,255,0.15); font-size:16px;\\'></i>'
                                        : '<i class=\\'fas fa-check-circle\\' style=\\'color:#10b981; font-size:16px;\\'></i>';
                                })(this)">
                            ${done
                                ? '<i class="fas fa-check-circle" style="color:#10b981; font-size:16px;"></i>'
                                : '<i class="fas fa-circle"       style="color:rgba(255,255,255,0.15); font-size:16px;"></i>'}
                        </button>
                    </div>
                    <!-- Content -->
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:800; font-size:14px; color:#fff; margin-bottom:5px;
                                    ${done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${skill}</div>
                        <div style="font-size:12px; color:rgba(255,255,255,0.55); line-height:1.55; margin-bottom:10px;">${goal}</div>
                        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:12px;">
                            <span style="display:flex; align-items:center; gap:5px; font-size:11px; color:${color}; font-weight:700;">
                                <i class="fas fa-clock" style="font-size:10px;"></i> ${time}
                            </span>
                            <span style="display:flex; align-items:center; gap:5px; font-size:11px; color:rgba(255,255,255,0.35);">
                                <i class="fas fa-flag" style="font-size:10px;"></i> ${target}
                            </span>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <a href="${w.learnUrl || '#'}" target="_blank" class="week-cta-link"
                               style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px;
                                      background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3);
                                      color:#4ade80; border-radius:8px; font-size:11px; font-weight:800;
                                      text-transform:uppercase; letter-spacing:0.8px; text-decoration:none;">
                                <i class="fas fa-book-open" style="font-size:10px;"></i> Start Learning
                            </a>
                            <a href="${w.practiceUrl || '#'}" target="_blank" class="week-cta-link"
                               style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px;
                                      background:rgba(255,161,22,0.1); border:1px solid rgba(255,161,22,0.3);
                                      color:#FFA116; border-radius:8px; font-size:11px; font-weight:800;
                                      text-transform:uppercase; letter-spacing:0.8px; text-decoration:none;">
                                <i class="fas fa-laptop-code" style="font-size:10px;"></i> Practice Now
                            </a>
                        </div>
                    </div>
                </div>`;
            } else {
                // ── full roadmap version ──
                return `
                <div class="week-exec-card" data-week-idx="${i}"
                     style="display:flex; gap:16px; align-items:flex-start; padding:16px 18px;
                            background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.05);
                            border-radius:14px; margin-bottom:2px;
                            animation: weekFadeIn 0.4s ease ${i * 0.06}s both;
                            opacity:${done ? '0.5' : '1'};">
                    <div style="flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:6px;">
                        <div style="width:34px; height:34px; border-radius:8px;
                                    background:${color}15; border:1px solid ${color}3a;
                                    display:flex; align-items:center; justify-content:center;
                                    font-size:11px; font-weight:900; color:${color};">${label}</div>
                        ${i < plan.length - 1
                            ? `<div style="width:1px; flex:1; min-height:16px; background:linear-gradient(180deg, ${color}44, transparent);"></div>`
                            : ''}
                    </div>
                    <div style="flex:1; min-width:0; padding-top:3px;">
                        <div style="font-weight:700; font-size:13px; color:rgba(255,255,255,0.9); margin-bottom:3px;
                                    ${done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${skill}</div>
                        <div style="font-size:11.5px; color:rgba(255,255,255,0.45); line-height:1.55; margin-bottom:8px;">${goal}</div>
                        <div style="display:flex; gap:14px; flex-wrap:wrap;">
                            <span style="font-size:10.5px; color:${color}; font-weight:700;">
                                <i class="fas fa-clock" style="font-size:9px;"></i> ${time}
                            </span>
                            <span style="font-size:10.5px; color:rgba(255,255,255,0.3);">
                                <i class="fas fa-bullseye" style="font-size:9px;"></i> ${target}
                            </span>
                        </div>
                    </div>
                </div>`;
            }
        }

        // ── Render High Impact panel ────────────────────────
        if (highEl) {
            if (!plan.length) {
                highEl.innerHTML = `
                    <div style="padding:30px; text-align:center; color:rgba(255,255,255,0.25); font-size:13px; font-style:italic;">
                        Weekly plan will appear after analysis is complete.
                    </div>`;
            } else {
                highEl.innerHTML =
                    `<div style="display:flex; flex-direction:column; gap:14px;">` +
                    plan.slice(0, 4).map((w, i) => buildWeekCard(w, i, true)).join('') +
                    `</div>`;
            }
        }

        // ── Render Roadmap panel ────────────────────────────
        if (roadmapEl) {
            if (!plan.length) {
                roadmapEl.innerHTML = `
                    <div style="padding:30px; text-align:center; color:rgba(255,255,255,0.25); font-size:13px; font-style:italic;">
                        Roadmap will appear after analysis is complete.
                    </div>`;
            } else {
                roadmapEl.innerHTML =
                    `<div style="display:flex; flex-direction:column; gap:10px;">` +
                    plan.map((w, i) => buildWeekCard(w, i, false)).join('') +
                    `</div>`;
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    //  COMPANY INTELLIGENCE RENDERERS (unchanged)
    // ═══════════════════════════════════════════════════════
    function getCompSkills(c) {
        let skills = [];
        if (Array.isArray(c.skills)) skills = c.skills;
        else if (c.skills && typeof c.skills === 'object') {
            skills = [...(c.skills.core || []), ...(c.skills.programming || []), ...(c.skills.tools || [])];
        } else if (typeof c.skills === 'string') skills = c.skills.split(',').map(s => s.trim());
        if (!skills.length) {
            const r = c.required_skills || c.requiredSkills;
            if (Array.isArray(r)) skills = r;
            else if (typeof r === 'string') skills = r.split(',').map(s => s.trim());
        }
        return skills.filter(Boolean);
    }

    function renderCompanyDetails(c) {
        if (!companyDetailsEl) return;
        companyDetailsEl.style.opacity = "0";
        setTimeout(() => {
            const name = c.companyName || c.company || c.company_name || 'Unknown';
            if (c.dataAvailable === false) {
                companyDetailsEl.innerHTML = `<div class="glass-card" style="padding:4rem;text-align:center;border:2px dashed rgba(212,175,55,0.1);border-radius:20px;">
                    <h2 style="color:#fff;">${esc(name)}</h2>
                    <p style="color:var(--primary);">Hiring intelligence profile pending verification.</p>
                </div>`;
            } else {
                const pkg   = c.package || "₹Market Standard";
                const steps = c.selectionProcess || [];
                const cgpa  = c.eligibility?.cgpa || c.cgpa || "No Cutoff";
                const acads = c.eligibility?.academics || c.academics || "All Streams";

                companyDetailsEl.innerHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;animation:slideUp 0.5s ease forwards;">
                    <div class="glass-card" style="grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:2rem;border:1px solid rgba(212,175,55,0.2);">
                        <div style="display:flex;align-items:center;gap:20px;">
                            <div style="width:70px;height:70px;background:rgba(212,175,55,0.1);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--primary);font-weight:900;">${name[0]}</div>
                            <div>
                                <h1 style="color:#fff;font-size:1.8rem;margin:0;">${esc(name)}</h1>
                                <span style="font-size:13px;color:rgba(255,255,255,0.4);">${esc(c.type || 'Engineering Partner')} &bull; ${esc(c.location || 'Multiple Cities')}</span>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:var(--primary);font-size:2.2rem;font-weight:900;">${esc(pkg)}</div>
                            <div style="font-size:11px;text-transform:uppercase;opacity:0.3;letter-spacing:1px;">Recruitment Intelligence</div>
                        </div>
                    </div>
                    <div class="glass-card" style="padding:1.5rem;border-left:4px solid #10b981;">
                        <h4 style="color:#10b981;margin-bottom:15px;"><i class="fas fa-graduation-cap"></i> Academic Metrics</h4>
                        <div style="margin-bottom:10px;"><label style="opacity:0.4;font-size:11px;display:block;">CUTOFF</label><strong style="font-size:1.4rem;">${esc(cgpa)}</strong></div>
                        <div><label style="opacity:0.4;font-size:11px;display:block;">ELIGIBLE STREAMS</label><p style="font-size:13px;">${esc(acads)}</p></div>
                    </div>
                    <div class="glass-card" style="padding:1.5rem;border-left:4px solid var(--primary);">
                        <h4 style="color:var(--primary);margin-bottom:15px;"><i class="fas fa-briefcase"></i> Role Specs</h4>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;">${(c.roles||[]).map(r=>`<span style="padding:5px 12px;background:rgba(212,175,55,0.05);color:var(--primary);font-size:12px;border-radius:4px;border:1px solid rgba(212,175,55,0.2);">${esc(r)}</span>`).join('')}</div>
                        <div style="margin-top:15px;font-size:12px;opacity:0.6;">${esc(c.eligibility?.backlogs || 'No active backlogs permitted.')}</div>
                    </div>
                    <div class="glass-card" style="padding:1.5rem;border-left:4px solid #60a5fa;">
                        <h4 style="color:#60a5fa;margin-bottom:15px;"><i class="fas fa-stream"></i> Selection Pipeline</h4>
                        <div style="display:flex;flex-direction:column;gap:12px;border-left:1px solid rgba(96,165,250,0.2);padding-left:15px;">
                            ${steps.map(s=>`<div style="font-size:13px;position:relative;"><span style="position:absolute;left:-19px;width:7px;height:7px;background:#60a5fa;border-radius:50%;top:4px;"></span>${esc(s)}</div>`).join('')}
                        </div>
                    </div>
                    <div class="glass-card" style="padding:1.5rem;border-left:4px solid #fff;">
                        <h4 style="color:#fff;opacity:0.8;margin-bottom:15px;"><i class="fas fa-tools"></i> Required Expertise</h4>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">${getCompSkills(c).map(s=>`<span style="padding:3px 10px;background:rgba(255,255,255,0.05);font-size:11px;border-radius:4px;">${esc(s)}</span>`).join('')}</div>
                        <div style="margin-top:20px;padding:10px;background:rgba(212,175,55,0.05);border-radius:8px;font-size:11px;font-weight:700;color:var(--primary);text-align:center;">Difficulty: ${esc(c.difficulty || 'Professional')}</div>
                    </div>
                </div>`;
            }
            companyDetailsEl.style.opacity = "1";
        }, 300);
    }

    function renderEmptyCompanyState() {
        if (!companyDetailsEl) return;
        companyDetailsEl.innerHTML = `<div class="glass-card" style="padding:4rem;text-align:center;opacity:0.5;">
            <div style="font-size:3rem;margin-bottom:1rem;">🏢</div>
            <h3>Discover Hiring Requirements</h3>
            <p>Select a company from the dropdown above.</p>
        </div>`;
    }

    init();

    // ── Global Skill Card Event Delegation (ONE LISTENER) ──
    const missingEl = document.getElementById("mentorMissing");
    if (missingEl) {
        missingEl.addEventListener('click', (e) => {
            const header  = e.target.closest('.skill-card-header');
            const planBtn = e.target.closest('[data-action="plan"]');
            const learnLink = e.target.closest('a[data-action="learn"]');

            // 1. Expand / Collapse
            if (header && !e.target.closest('a') && !e.target.closest('button')) {
                const card = header.closest('.skill-card');
                const body = card.querySelector('.skill-card-body');
                const chev = header.querySelector('.chev');
                if (!body || !chev) return;

                const isOpen = body.style.display !== 'none';
                body.style.display = isOpen ? 'none' : 'block';
                chev.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                card.style.borderColor = isOpen ? 'rgba(255,255,255,0.07)' : (header.dataset.borderColor || 'rgba(212,175,55,0.3)');
                return;
            }

            // 2. Add to Plan
            if (planBtn) {
                e.stopPropagation();
                const skillId = planBtn.dataset.skillId;
                const added   = togglePlan(skillId);
                planBtn.textContent  = added ? '✓ In Plan' : '+ Add to Plan';
                planBtn.style.color  = added ? '#10b981' : 'rgba(255,255,255,0.55)';
                planBtn.style.borderColor = added ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)';
                showToast(added ? 'Added to plan.' : 'Removed from plan.', 'info');
                
                // Update badge in header if exists
                const card = planBtn.closest('.skill-card');
                const badge = card?.querySelector('.plan-badge');
                if (badge) badge.style.display = added ? 'inline' : 'none';
                return;
            }

            // 3. Track Learn
            if (learnLink) {
                const skillId = learnLink.dataset.skillId;
                if (skillId) {
                    markStarted(skillId);
                    showToast(`Learning session logged for ${skillId} 🚀`, 'success');
                    refreshProgressInCard(skillId);
                }
            }
        });
    }
});
