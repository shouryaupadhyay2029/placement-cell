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
        await new Promise(r => setTimeout(r, 900));
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
    } catch (e) {
        console.error("[fetch companies]", e);
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
            await window.evaluateGlobalEligibility();
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
    window.evaluateGlobalEligibility = async function () {
        if (!currentUserProfile) return;

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

            if (!data.success) throw new Error(data.message || "Analysis failed");

                // Full pipeline trace
            console.info('[SPA v4.1] Raw input:', data._meta?.rawInput);
            console.info('[SPA v4.1] Parsed tokens:', data._meta?.parsedTokens);
            console.info('[SPA v4.1] Recognized:', data._meta?.recognizedSkills);
            console.info('[SPA v4.1] Unrecognized:', data._meta?.unrecognizedTokens);
            console.info('[SPA v4.1] Profile:', data.profileType, '| Stage:', data.stage);
            console.info('[SPA v4.1] Gaps:', data.gaps?.total);

            localStorage.setItem("lastAnalysis_v4", JSON.stringify(data));
            show("eligibilityResults");
            hide("eligibilityEmpty");
            renderDashboard(data);

        } catch (err) {
            console.error("❌ Eligibility Engine:", err);
            showToast("Could not reach the analysis engine. Check server and retry.", "error");
        } finally {
            showLoader(false);
        }
    };

    // ═══════════════════════════════════════════════════════
    //  MASTER RENDERER
    // ═══════════════════════════════════════════════════════
    function renderDashboard(d) {
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

        const unrecognizedBanner = unrecognized.length > 0 ? `
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:10px; padding:12px 16px; margin-bottom:14px; font-size:12px; color:rgba(255,255,255,0.6);">
                ⚠ <strong style="color:#f59e0b;">${unrecognized.length} skill${unrecognized.length > 1 ? 's' : ''} not recognized:</strong>
                ${unrecognized.map(u => `<code style="background:rgba(255,255,255,0.06); padding:1px 6px; border-radius:4px; font-size:11px;">${esc(u)}</code>`).join(' ')}
                — try standard names like <em>Python, JavaScript, DSA, Java, React, SQL</em>
            </div>` : '';

        el.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
                <span style="font-size:10px; font-weight:800; padding:4px 12px; border-radius:20px; background:${stageColor}22; color:${stageColor}; border:1px solid ${stageColor}55; text-transform:uppercase; letter-spacing:1.5px;">${esc(d.stage || 'beginner')} stage</span>
                <span style="font-size:11px; color:rgba(255,255,255,0.35);">Recognized ${totalRecognized} of ${totalParsed} input skill${totalParsed !== 1 ? 's' : ''}</span>
            </div>
            ${unrecognizedBanner}

            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px; margin-bottom:16px;">
                <div style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px;">📊 Profile Reality Check</div>
                <p style="font-size:14px; color:rgba(255,255,255,0.8); line-height:1.75; margin:0;">${esc(ins.honestDescription || '')}</p>
            </div>

            <div style="background:rgba(212,175,55,0.06); border:1px solid rgba(212,175,55,0.2); border-radius:12px; padding:16px; margin-bottom:14px;">
                <div style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">⚡ Highest Impact Action</div>
                <p style="font-size:13px; color:rgba(255,255,255,0.75); margin:0; line-height:1.65;">${esc(ins.immediateAction || '')}</p>
            </div>

            ${ins.depthAnalysis ? `
            <div style="font-size:13px; color:rgba(255,255,255,0.45); line-height:1.65; padding:12px 16px; background:rgba(255,255,255,0.01); border-radius:10px; border:1px solid rgba(255,255,255,0.04);">
                ${esc(ins.depthAnalysis)}
            </div>` : ''}
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
                No recognized skills found. Ensure your skills match known technologies (e.g., "JavaScript", "Python", "DSA").
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
            const color = domainColors[s.category] || '#60a5fa';
            return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:rgba(16,185,129,0.03); border:1px solid rgba(16,185,129,0.12); border-radius:12px;">
                    <div>
                        <div style="font-weight:700; font-size:14px; color:#fff; margin-bottom:3px;">${esc(s.name)}</div>
                        <span style="font-size:10px; padding:2px 8px; border-radius:20px; background:${color}15; color:${color}; border:1px solid ${color}33; text-transform:uppercase; letter-spacing:1px;">${s.category?.replace('_', ' ') || 'skill'}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:12px; color:#10b981; font-weight:700; margin-bottom:2px;">${s.demandScore || '?'}% demand</div>
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

        const PRIORITY_CONFIG = {
            CRITICAL: { label: "Critical Gap",     color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: "🚨" },
            HIGH:     { label: "High Priority",    color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: "⚠️" },
            MEDIUM:   { label: "Valuable Add-on",  color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.25)", icon: "💡" }
        };

        const sections = [
            { key: 'critical', items: gaps.critical || [], cfg: PRIORITY_CONFIG.CRITICAL },
            { key: 'high',     items: gaps.high     || [], cfg: PRIORITY_CONFIG.HIGH },
            { key: 'medium',   items: gaps.medium   || [], cfg: PRIORITY_CONFIG.MEDIUM }
        ].filter(s => s.items.length > 0);

        if (!sections.length) {
            el.innerHTML = `<div style="padding:24px; text-align:center; color:rgba(255,255,255,0.3); font-size:13px;">No significant gaps detected with current skill data.</div>`;
            return;
        }

        let html = '';
        sections.forEach(({ items, cfg }) => {
            html += `
                <div style="margin-bottom:2rem;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:1rem;">
                        <span style="font-size:1rem;">${cfg.icon}</span>
                        <span style="font-size:10px; font-weight:900; color:${cfg.color}; text-transform:uppercase; letter-spacing:2px;">${cfg.label}</span>
                        <div style="flex:1; height:1px; background:${cfg.border};"></div>
                        <span style="font-size:10px; color:rgba(255,255,255,0.2);">${items.length} skill${items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        ${items.map(skill => buildSkillCard(skill, cfg)).join('')}
                    </div>
                </div>
            `;
        });

        el.innerHTML = html;

        // ── Event Delegation (one listener for ALL interactions) ─
        el.addEventListener('click', function(e) {
            const header = e.target.closest('.skill-card-header');
            const planBtn = e.target.closest('[data-action="plan"]');

            // Expand / Collapse (only if header clicked, not a link inside)
            if (header && !e.target.closest('a') && !e.target.closest('button')) {
                const card   = header.closest('.skill-card');
                const body   = card.querySelector('.skill-card-body');
                const chev   = header.querySelector('.chev');
                if (!body || !chev) return;
                const isOpen = body.style.display !== 'none';
                body.style.display   = isOpen ? 'none' : 'block';
                chev.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                if (!isOpen) card.style.borderColor = header.dataset.borderColor || 'rgba(212,175,55,0.3)';
                else card.style.borderColor = 'rgba(255,255,255,0.07)';
                return;
            }

            // Add to Plan button
            if (planBtn) {
                e.preventDefault();
                e.stopPropagation();
                const skillId = planBtn.dataset.skillId;
                const added   = togglePlan(skillId);
                planBtn.textContent  = added ? '✓ In Plan' : '+ Add to Plan';
                planBtn.style.color  = added ? '#10b981' : 'rgba(255,255,255,0.55)';
                planBtn.style.borderColor = added ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)';
                showToast(added ? 'Added to your learning plan.' : 'Removed from plan.', 'info');
                // Also update badge in header
                const card = planBtn.closest('.skill-card');
                const badge = card?.querySelector('.plan-badge');
                if (badge) badge.style.display = added ? 'inline' : 'none';
                return;
            }
        });

        // ── Learn button click tracking (separate since it navigates) ─
        el.querySelectorAll('a[data-action="track-learn"]').forEach(a => {
            a.addEventListener('click', e => {
                const skillId = a.dataset.skillId;
                if (skillId) {
                    markStarted(skillId);
                    showToast(`Learning session started for ${skillId} 🚀`, 'success');
                    refreshProgressInCard(skillId);
                }
            });
        });
    }

    function buildSkillCard(skill, cfg) {
        const sp        = getProgress(skill.id);
        const inPlan    = sp.inPlan;
        const progress  = sp.progress;
        const diffColors = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
        const dColor     = diffColors[skill.difficulty] || '#60a5fa';

        const roadmapHtml = (lvl, steps, color) => `
            <div style="background:rgba(0,0,0,0.3); border-radius:10px; padding:12px; border-top:2px solid ${color};">
                <div style="font-size:9px; font-weight:800; color:${color}; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">${lvl}</div>
                ${(steps || []).map(s => `<div style="font-size:11px; color:rgba(255,255,255,0.55); margin-bottom:6px; padding-left:6px; border-left:2px solid ${color}44; line-height:1.4;">${esc(s)}</div>`).join('')}
            </div>
        `;

        return `
        <div class="skill-card" data-id="${skill.id}" style="border:1px solid rgba(255,255,255,0.07); border-radius:18px; overflow:hidden; background:rgba(10,10,10,0.95); transition:border-color 0.2s;">

            <!-- HEADER -->
            <div class="skill-card-header" style="padding:20px 22px; cursor:pointer; user-select:none;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:8px;">
                            <h3 style="color:#fff; font-size:1.05rem; margin:0; font-weight:700;">${esc(skill.name)}</h3>
                            <span style="font-size:9px; padding:3px 9px; border-radius:20px; background:${cfg.bg}; color:${cfg.color}; border:1px solid ${cfg.border}; font-weight:800; text-transform:uppercase; letter-spacing:1px;">${cfg.label}</span>
                            ${inPlan ? `<span style="font-size:9px; padding:3px 9px; border-radius:20px; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-weight:800;">✓ IN PLAN</span>` : ''}
                        </div>
                        <div style="display:flex; gap:14px; flex-wrap:wrap; margin-bottom:10px;">
                            <span style="font-size:11px; color:${dColor}; font-weight:700;">⚡ ${esc(skill.difficulty)}</span>
                            <span style="font-size:11px; color:rgba(255,255,255,0.4);">⏱ ~${skill.estimatedWeeks}w · ${skill.dailyHours}h/day</span>
                            <span style="font-size:11px; color:rgba(255,255,255,0.4);">📊 ${skill.demandScore}% demand</span>
                        </div>
                        <!-- Demand bar -->
                        <div style="height:2px; background:rgba(255,255,255,0.05); border-radius:2px; width:100%;">
                            <div style="height:100%; width:${skill.demandScore}%; background:${cfg.color}; border-radius:2px; transition:width 1s ease;"></div>
                        </div>
                        ${progress > 0 ? `
                        <div style="margin-top:6px;">
                            <div style="height:2px; background:rgba(167,139,250,0.1); border-radius:2px;">
                                <div id="pbar-${skill.id}" style="height:100%; width:${progress}%; background:#a78bfa; border-radius:2px;"></div>
                            </div>
                            <div style="font-size:10px; color:#a78bfa; margin-top:3px;">Progress: ${progress}%</div>
                        </div>` : `<div id="pbar-wrap-${skill.id}"></div>`}
                    </div>
                    <i class="fas fa-chevron-down chev" style="color:rgba(255,255,255,0.3); margin-left:14px; margin-top:4px; transition:transform 0.3s ease; font-size:0.85rem;"></i>
                </div>
            </div>

            <!-- BODY (Collapsed by default) -->
            <div class="skill-card-body" style="display:none; border-top:1px solid rgba(255,255,255,0.05);">
                <div style="padding:22px;">

                    <!-- Mentor Reasoning -->
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; margin-bottom:18px;">
                        <div style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px;">🧠 Mentor Analysis</div>
                        <p style="font-size:13px; color:rgba(255,255,255,0.75); line-height:1.7; margin:0 0 10px 0;">${esc(skill.reasoning || skill.whyItMatters || '')}</p>
                        ${skill.impactIfIgnored ? `<div style="padding:10px 14px; background:rgba(239,68,68,0.05); border-left:3px solid rgba(239,68,68,0.4); border-radius:6px; font-size:12px; color:rgba(255,255,255,0.5); line-height:1.5;">⚠ If ignored: ${esc(skill.impactIfIgnored)}</div>` : ''}
                    </div>

                    <!-- Skill Roadmap -->
                    ${skill.roadmap ? `
                    <div style="margin-bottom:18px;">
                        <div style="font-size:10px; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px;">📍 Learning Path</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                            ${roadmapHtml('Beginner', skill.roadmap.beginner, '#10b981')}
                            ${roadmapHtml('Intermediate', skill.roadmap.intermediate, '#f59e0b')}
                            ${roadmapHtml('Advanced', skill.roadmap.advanced, '#a78bfa')}
                        </div>
                    </div>` : ''}

                    <!-- Monthly Plan -->
                    ${skill.monthlyPlan?.length ? `
                    <div style="margin-bottom:18px;">
                        <div style="font-size:10px; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px;">📅 30-Day Plan</div>
                        ${skill.monthlyPlan.map(step => `
                            <div style="display:flex; gap:10px; padding:10px 12px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.03); margin-bottom:6px;">
                                <i class="fas fa-calendar-day" style="color:var(--primary); margin-top:2px; font-size:0.75rem; flex-shrink:0;"></i>
                                <span style="font-size:12px; color:rgba(255,255,255,0.6); line-height:1.5;">${esc(step)}</span>
                            </div>
                        `).join('')}
                    </div>` : ''}

                    <!-- Stats Row -->
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:18px;">
                        <div style="text-align:center; padding:12px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                            <div style="font-size:1.4rem; font-weight:900; color:${dColor};">${skill.difficultyScore ?? '?'}/10</div>
                            <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-top:4px;">Difficulty</div>
                        </div>
                        <div style="text-align:center; padding:12px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                            <div style="font-size:1.4rem; font-weight:900; color:#60a5fa;">${skill.estimatedWeeks}w</div>
                            <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-top:4px;">Time Est.</div>
                        </div>
                        <div style="text-align:center; padding:12px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                            <div style="font-size:1.4rem; font-weight:900; color:#f59e0b;">${skill.dailyHours}h</div>
                            <div style="font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-top:4px;">Daily</div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <a href="${skill.links?.theory || '#'}" target="_blank"
                           data-action="learn" data-skill-id="${skill.id}" data-url="${skill.links?.theory || '#'}"
                           style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; background:rgba(47,141,70,0.15); border:1px solid rgba(47,141,70,0.4); color:#4ade80; border-radius:8px; font-size:12px; font-weight:700; text-decoration:none; transition:all 0.2s;">
                            <i class="fas fa-book-open"></i> Start Learning
                        </a>
                        <a href="${skill.links?.practice || '#'}" target="_blank"
                           style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; background:rgba(255,161,22,0.12); border:1px solid rgba(255,161,22,0.4); color:#FFA116; border-radius:8px; font-size:12px; font-weight:700; text-decoration:none; transition:all 0.2s;">
                            <i class="fas fa-terminal"></i> Practice Now
                        </a>
                        ${skill.links?.guide ? `
                        <a href="${skill.links.guide}" target="_blank"
                           style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; background:rgba(167,139,250,0.1); border:1px solid rgba(167,139,250,0.3); color:#a78bfa; border-radius:8px; font-size:12px; font-weight:700; text-decoration:none; transition:all 0.2s;">
                            <i class="fas fa-map"></i> Roadmap
                        </a>` : ''}
                        <button data-action="plan" data-skill-id="${skill.id}"
                            style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; background:rgba(255,255,255,0.04); border:1px solid ${inPlan ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}; color:${inPlan ? '#10b981' : 'rgba(255,255,255,0.55)'}; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.2s;">
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
    //  SECTION 4: MARKET INSIGHTS
    // ─────────────────────────────────────────────────────
    function renderMarketInsights(insights) {
        const el = document.getElementById("mentorTrends");
        if (!el) return;

        if (!insights.length) {
            el.innerHTML = `<p style="color:rgba(255,255,255,0.25);font-size:13px;">No market insights generated.</p>`;
            return;
        }

        el.innerHTML = insights.map(ins => `
            <div style="padding:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:14px; border-left:3px solid ${ins.statusColor || '#60a5fa'};">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.7);">${esc(ins.segment)}</div>
                    <span style="font-size:9px; padding:3px 10px; border-radius:20px; background:${ins.statusColor}22; color:${ins.statusColor}; border:1px solid ${ins.statusColor}44; font-weight:800; text-transform:uppercase;">${esc(ins.status)}</span>
                </div>
                <p style="font-size:12px; color:rgba(255,255,255,0.5); margin:0; line-height:1.65;">${esc(ins.insight)}</p>
            </div>
        `).join('');
    }

    // ─────────────────────────────────────────────────────
    //  SECTION 5: ACTION PLAN
    // ─────────────────────────────────────────────────────
    function renderActionPlan(plan) {
        // Action plan rendered to both High Impact and Roadmap sections
        const highEl    = document.getElementById("mentorHighImpact");
        const roadmapEl = document.getElementById("mentorRoadmap");

        if (highEl) {
            if (!plan.length) {
                highEl.innerHTML = `<p style="color:rgba(255,255,255,0.25);font-size:13px;">Complete analysis to generate your weekly plan.</p>`;
            } else {
                highEl.innerHTML = plan.slice(0, 4).map((w, i) => `
                    <div style="display:flex; gap:14px; padding:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:14px; border-left:3px solid var(--primary);">
                        <div style="width:36px; height:36px; border-radius:50%; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; color:var(--primary); flex-shrink:0;">W${i + 1}</div>
                        <div style="flex:1;">
                            <div style="font-weight:700; font-size:13px; color:#fff; margin-bottom:4px;">${esc(w.skill)}</div>
                            <div style="font-size:12px; color:rgba(255,255,255,0.5); line-height:1.5;">${esc(w.goal)}</div>
                            <div style="display:flex; gap:12px; margin-top:6px;">
                                <span style="font-size:10px; color:var(--primary);">⏱ ${esc(w.dailyCommitment)}</span>
                                <span style="font-size:10px; color:rgba(255,255,255,0.3);">Target: ${esc(w.milestone)}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (roadmapEl) {
            roadmapEl.innerHTML = plan.map((w, i) => `
                <div style="display:flex; gap:14px; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.03);">
                    <div style="width:26px; height:26px; border:1.5px solid rgba(167,139,250,0.5); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; color:#a78bfa; flex-shrink:0;">${i + 1}</div>
                    <div>
                        <div style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.8); margin-bottom:3px;">${esc(w.skill)}</div>
                        <p style="font-size:12px; color:rgba(255,255,255,0.5); line-height:1.5; margin:0;">${esc(w.goal)}</p>
                    </div>
                </div>
            `).join('');
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
});
