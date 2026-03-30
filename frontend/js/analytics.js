document.addEventListener('DOMContentLoaded', async () => {
    // Shared PlacePro Theme Colors Configuration
    const primaryColor = '#10b981';
    const surfaceColor = 'rgba(20, 20, 20, 0.8)';
    const textColor = '#f8f8f8';
    const gridColor = 'rgba(16, 185, 129, 0.1)';
    const tooltipBg = 'rgba(0, 0, 0, 0.8)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Poppins', sans-serif";

    // Unregister datalabels globally — only apply per-chart via plugins:[]
    if (window.ChartDataLabels) {
        Chart.unregister(ChartDataLabels);
    }

    function animateValue(obj, start, end, duration) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(1).replace(/\.0$/, '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    let batchChart = null;
    let typeChart = null;
    let recruitmentChart = null;

    async function loadAnalytics(year = '') {
        const loader = document.getElementById("loader");
        if (loader) loader.classList.remove("hidden");

        try {
            // 1. Fetch Main Stats from Consolidated API
            const response = await window.api.get(`/companies/analytics${year ? '?batch_year=' + year : ''}`);
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const data = await response.json();

            // 2. Populate Cards
            const placementElem = document.getElementById('placementRate');
            const activeElem = document.getElementById('activeCompanies');
            const highestElem = document.getElementById('highestPackage');
            const avgElem = document.getElementById('avgPackage');

            animateValue(placementElem, 0, data.placement_rate || 0, 1000);
            animateValue(activeElem, 0, data.active_companies || 0, 1000);
            animateValue(highestElem, 0, data.highest_package || 0, 1000);
            animateValue(avgElem, 0, data.avg_package || 0, 1000);

            // 3. Render Charts
            renderBatchChart(data.batch_distribution || {});
            
            // Conditional Company Type Chart (Hide for USICT)
            const college = localStorage.getItem('college') || 'USAR';
            const typeCtx = document.getElementById('companyTypeChart');
            const typeCard = typeCtx ? typeCtx.closest('.chart-card') : null;
            
            if (typeCard) {
                if (college === 'USICT') {
                    typeCard.style.display = 'none';
                } else {
                    typeCard.style.display = 'block';
                    renderTypeChart(data.type_distribution || {});
                }
            }

            populateTopCompanies(data.top_companies || []);

            // 4. Detail Data Refresh
            await loadRecruitmentChart(year);
            await loadBranchStats(year);

            // 5. Internship Section Visibility (Only for 2025)
            const internSection = document.getElementById('internshipSection');
            if (internSection) {
                internSection.style.display = (year === '2025') ? 'block' : 'none';
            }

        } catch (err) {
            console.error('Error loading analytics:', err);
        }
    }

    function renderBatchChart(batchDist) {
        const ctx = document.getElementById('batchYearChart');
        if (!ctx) return;
        if (batchChart) batchChart.destroy();

        let keys = Object.keys(batchDist).sort();
        let values = keys.map(k => batchDist[k]);
        if (keys.length === 0) { keys = ['No Data']; values = [0]; }

        batchChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: keys,
                datasets: [{
                    label: 'Companies',
                    data: values,
                    backgroundColor: primaryColor,
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: gridColor }, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function renderTypeChart(typeDist) {
        const ctx = document.getElementById('companyTypeChart');
        if (!ctx) return;
        if (typeChart) typeChart.destroy();

        // Handle both array [{name,value}] and plain object {key: val} formats
        let keys, values;
        if (Array.isArray(typeDist)) {
            keys   = typeDist.map(d => d.name);
            values = typeDist.map(d => d.value);
        } else {
            keys   = Object.keys(typeDist);
            values = keys.map(k => typeDist[k]);
        }
        if (keys.length === 0) { keys = ['No Data']; values = [1]; }

        // Compute percentages for labels
        const total = values.reduce((s, v) => s + v, 0);

        typeChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: keys,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#1565C0', // Software & IT — deep blue
                        '#4CAF50', // Sales & Consulting — green
                        '#FFA726', // Data Science/AIML — amber
                        '#26C6DA', // Cloud & DevOps — teal
                        '#EF5350', // Electronics & IoT — red
                        '#AB47BC', // Mechatronics — purple
                        '#78909C', // Technical Consultant — slate
                        '#66BB6A', // Product Management — light green
                    ],
                    borderWidth: 2,
                    borderColor: '#111',
                    hoverOffset: 14
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#D4AF37',          // Golden theme
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12, weight: '600' },
                            generateLabels: (chart) => {
                                const ds = chart.data.datasets[0];
                                return chart.data.labels.map((label, i) => {
                                    const val = ds.data[i];
                                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                    return {
                                        text: `${label} ${pct}%`,
                                        fillStyle: ds.backgroundColor[i],
                                        strokeStyle: ds.backgroundColor[i],
                                        lineWidth: 0,
                                        fontColor: '#D4AF37',
                                        index: i
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const val = ctx.raw;
                                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                return ` ${ctx.label}: ${pct}%`;
                            }
                        }
                    }
                }
            }
        });
    }


    function populateTopCompanies(topComps) {
        const tbody = document.getElementById('topCompaniesBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (topComps.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; opacity: 0.7;">No data available</td></tr>`;
        } else {
            topComps.forEach((comp, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td><strong>${comp.name}</strong></td>
                    <td>${comp.role}</td>
                    <td>${comp.package_str || 'NA'}</td>
                    <td>${comp.students_placed !== undefined ? comp.students_placed : '—'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    async function loadRecruitmentChart(batchYear = '') {
        try {
            const url = `/companies/recruitment${batchYear ? '?batch_year=' + batchYear : ''}`;
            const res = await window.api.get(url);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            // Filter out companies with 0 recruitment for a cleaner ranking/chart
            const filteredIndices = (data.students_placed || []).map((v, i) => v > 0 ? i : -1).filter(i => i !== -1);
            const allCompanies = filteredIndices.map(i => data.companies[i]);
            const allPlaced = filteredIndices.map(i => data.students_placed[i]);
            const allTypes = filteredIndices.map(i => data.company_types[i] || "—");
            const total = data.total_placed || 0;

            const label = document.getElementById('totalPlacedLabel');
            if (label) label.textContent = `Total Placed: ${total}`;

            // Store data for view switching
            window.recruitmentData = {
                companies: allCompanies,
                placed: allPlaced,
                types: allTypes,
                total: total,
                batchYear: batchYear
            };

            // Populate Full Ranking Table
            const rankingBody = document.getElementById('fullRankingBody');
            if (rankingBody) {
                rankingBody.innerHTML = allCompanies.map((name, i) => {
                    const count = allPlaced[i];
                    const type = allTypes[i];
                    const share = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    return `
                        <tr>
                            <td><strong>#${i + 1}</strong></td>
                            <td style="font-weight:600;">${name}</td>
                            <td><span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);">${type}</span></td>
                            <td style="opacity:0.7;">NA</td>
                            <td style="color:var(--primary); font-weight:700;">${count}</td>
                            <td style="opacity:0.6;">${share}%</td>
                        </tr>
                    `;
                }).join('');
            }

            // Sync pill UI
            const chartViewMode = document.getElementById('chartViewMode');
            if (chartViewMode) {
                chartViewMode.querySelectorAll('.chart-pill').forEach(p => {
                    p.classList.remove('active');
                    if (p.getAttribute('data-view') === '10') p.classList.add('active');
                });
            }

            // Initial Render (Directly call view render)
            renderRecruitmentChartView('10');

        } catch (e) {
            console.error('Recruitment chart error:', e);
        }
    }

    function renderRecruitmentChartView(mode) {
        if (!window.recruitmentData) return;
        const { companies, placed, total } = window.recruitmentData;

        let displayCompanies = [...companies];
        let displayPlaced = [...placed];

        if (mode === '10') {
            displayCompanies = companies.slice(0, 10);
            displayPlaced = placed.slice(0, 10);
        } else if (mode === '20') {
            displayCompanies = companies.slice(0, 20);
            displayPlaced = placed.slice(0, 20);
        }

        const container = document.getElementById('chartResizableContainer');
        const canvas = document.getElementById('companyRecruitmentChart');
        if (!canvas || !container) return;

        // Dynamic Height Calculation: Ensure each bar gets enough vertical space
        const barStep = 34; // px per bar including gap
        const basePadding = 50;
        const targetHeight = Math.max(380, (displayCompanies.length * barStep) + basePadding);

        container.style.height = targetHeight + 'px';

        if (recruitmentChart) recruitmentChart.destroy();

        const ctx = canvas.getContext('2d');
        recruitmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: displayCompanies,
                datasets: [{
                    label: 'Students Placed',
                    data: displayPlaced,
                    backgroundColor: displayCompanies.map((_, i) => {
                        const opacity = 1 - (i / (displayCompanies.length || 1)) * 0.45;
                        return `rgba(16, 185, 129, ${Math.max(0.4, opacity)})`;
                    }),
                    borderRadius: 5,
                    borderSkipped: false,
                    barThickness: 20,
                }]
            },
            options: {
                indexAxis: 'y', // Makes it horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        titleFont: { size: 14, weight: '700' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        cornerRadius: 10,
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                const val = context.parsed.x;
                                const share = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                                const rank = companies.indexOf(context.label) + 1;
                                return [
                                    ` Placed: ${val} students`,
                                    ` Rank: #${rank}`,
                                    ` Share: ${share}% of total`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: 'rgba(16, 185, 129, 0.05)' },
                        ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: '#fff',
                            font: { size: 12, weight: '600' },
                            callback: function (value) {
                                let label = this.getLabelForValue(value);
                                return label.length > 20 ? label.substr(0, 18) + '...' : label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Chart View Mode Listeners
    const chartViewMode = document.getElementById('chartViewMode');
    if (chartViewMode) {
        chartViewMode.querySelectorAll('.chart-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                chartViewMode.querySelectorAll('.chart-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                renderRecruitmentChartView(pill.getAttribute('data-view'));
            });
        });
    }

    async function loadBranchStats(batchYear = '') {
        const college = localStorage.getItem("college") || "USAR";
        const analyticsCard = document.querySelector('.analytics-card');

        // SPECIAL CASE: USICT 2021 & 2022 - Focus on elite high-fidelity direct placement tables
        if (college === "USICT" && (batchYear === "2021" || batchYear === "2022")) {
            try {
                // 1. Fetch Direct Placements (High Value Roles)
                const res = await window.api.get(`/companies?batch_year=${batchYear}`);
                const allCompanies = await res.json();
                const directPlaced = allCompanies.filter(c => c.role === "Direct Placement");

                // 2. Fetch Official Branch Rates (If available)
                const brUrl = `/companies/branch-stats?batch_year=${batchYear}`;
                const brRes = await window.api.get(brUrl);
                const brData = await brRes.json();
                const officialRates = brData.official_rates || [];

                if (analyticsCard) {
                    let html = `
                        <div class="card-header" style="margin-bottom: 25px;">
                            <h3 style="color: var(--text-main); font-size: 1.1rem; font-weight: 700;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="margin-right: 12px; vertical-align: middle;">
                                    <path d="M16 21v-2a4 0 0 0-4-4H5a4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <polyline points="17 11 19 13 23 9"></polyline>
                                </svg>
                                Directly Placed Students (${batchYear})
                            </h3>
                        </div>
                        <div class="table-container mini-table" style="margin-bottom: 30px;">
                            <table style="width: 100%; font-size: 13px;">
                                <thead>
                                    <tr>
                                        <th style="padding: 10px; text-align: left;">Company</th>
                                        <th style="padding: 10px; text-align: center;">Selections</th>
                                        <th style="padding: 10px; text-align: right;">Package (LPA)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${directPlaced.map((c, i) => `
                                        <tr style="${i % 2 === 0 ? 'background: rgba(16, 185, 129, 0.03);' : ''}">
                                            <td style="padding: 10px; font-weight: 600;">${c.company_name}</td>
                                            <td style="padding: 10px; text-align: center; color: var(--primary); font-weight: 700;">${c.students_placed}</td>
                                            <td style="padding: 10px; text-align: right; opacity: 0.8; font-weight: 600;">${c.package}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;

                    // Add Branch Statistics Table if it's 2022
                    if (officialRates.length > 0) {
                        html += `
                            <div class="card-header" style="margin-bottom: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05);">
                                <h3 style="color: var(--text-main); font-size: 1.1rem; font-weight: 700;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="margin-right: 12px; vertical-align: middle;">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    Official Branch-wise Statistics
                                </h3>
                            </div>
                            <div class="table-container mini-table">
                                <table style="width: 100%; font-size: 13px;">
                                    <thead>
                                        <tr>
                                            <th style="padding: 10px; text-align: left;">Branch</th>
                                            <th style="padding: 10px; text-align: right;">Placement Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${officialRates.map((r, i) => `
                                            <tr style="${i % 2 === 0 ? 'background: rgba(255,255,255,0.02);' : ''}">
                                                <td style="padding: 10px; font-weight: 500;">${r.name}</td>
                                                <td style="padding: 10px; text-align: right; color: var(--primary); font-weight: 700;">${r.rate.toFixed(2)}%</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr style="background: rgba(16, 185, 129, 0.1); border-top: 2px solid var(--primary);">
                                            <td style="padding:10px; font-weight: 800; font-size: 14px;">Total Institutional Average</td>
                                            <td style="padding:10px; text-align: right; color: var(--primary); font-weight: 800; font-size: 14px;">${(brData.overall_rate || 0).toFixed(2)}%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        `;
                    }
                    analyticsCard.innerHTML = html;
                }
                return; // Exit early for high-fidelity special cases
            } catch (err) {
                console.error("Failed to load institutional analytics:", err);
            }
        }

        // DEFAULT CASE: Branch-wise Placement Statistics
        try {
            // Restore original UI if it was swapped (or if it's the first render)
            if (analyticsCard) {
                analyticsCard.innerHTML = `
                    <div class="card-header" style="margin-bottom: 25px;">
                        <h3 style="color: var(--text-main); font-size: 1.1rem; font-weight: 700;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)"
                                stroke-width="2" style="margin-right: 12px; vertical-align: middle;">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            Branch-wise Placement Statistics
                        </h3>
                    </div>

                    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center;">
                        <div style="height: 300px; position: relative;">
                            <canvas id="branchBreakdownChart"></canvas>
                        </div>
                        <div>
                            <div class="table-container mini-table">
                                <table style="font-size: 13px;">
                                    <thead>
                                        <tr>
                                            <th>Branch</th>
                                            <th>Students</th>
                                            <th>Percent</th>
                                        </tr>
                                    </thead>
                                    <tbody id="branchStatsBody"></tbody>
                                </table>
                            </div>
                            <p id="branchTotalLabel" style="margin-top: 15px; font-size: 13px; color: var(--text-muted); text-align: right;"></p>
                        </div>
                    </div>
                `;
            }

            const url = `/companies/branch-stats${batchYear ? '?batch_year=' + batchYear : ''}`;
            const res = await window.api.get(url);
            const data = await res.json();

            const isOfficial = data.official_rates && data.official_rates.length > 0;
            const labels = isOfficial ? data.official_rates.map(r => r.name) : (data.labels || []);
            const counts = isOfficial ? data.official_rates.map(r => r.rate) : (data.counts || []);
            const total = isOfficial ? 100 : (data.total || 0);

            // SPECIAL CASE: Official Rates Table Override (e.g. USICT 2022)
            if (isOfficial) {
                if (analyticsCard) {
                    analyticsCard.innerHTML = `
                        <div class="card-header" style="margin-bottom: 25px;">
                            <h3 style="color: var(--text-main); font-size: 1.1rem; font-weight: 700;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="margin-right: 12px; vertical-align: middle;">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                                Branch-wise Placement Statistics (Official)
                            </h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 20px;">
                            <div style="height: 220px; position: relative;">
                                <canvas id="branchBreakdownChart"></canvas>
                            </div>
                            <div class="table-container mini-table">
                                <table style="width: 100%; font-size: 14px;">
                                    <thead>
                                        <tr>
                                            <th style="text-align: left;">Branch</th>
                                            <th style="text-align: right;">Placed (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.official_rates.map(r => `
                                            <tr>
                                                <td style="font-weight: 600;">${r.name}</td>
                                                <td style="text-align: right; color: var(--primary); font-weight: 700;">${r.rate.toFixed(2)}%</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr style="background: rgba(16, 185, 129, 0.1); border-top: 2px solid var(--primary);">
                                            <td style="padding:10px; font-weight: 800; font-size: 15px;">Overall Institutional Total</td>
                                            <td style="padding:10px; text-align: right; color: var(--primary); font-weight: 800; font-size: 15px;">${(data.overall_rate || 0).toFixed(2)}%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    `;
                }
            } else {
                const totalLabel = document.getElementById('branchTotalLabel');
                if (totalLabel) totalLabel.innerText = `${total} Selected Students Mapped by Branch`;

                const body = document.getElementById('branchStatsBody');
                if (body) {
                    body.innerHTML = labels.map((b, i) => {
                        const c = counts[i];
                        const p = total > 0 ? ((c / total) * 100).toFixed(1) : 0;
                        return `
                        <tr>
                            <td style="font-weight:600;">${b}</td>
                            <td style="color:var(--primary); font-weight:700;">${c}</td>
                            <td style="opacity:0.6;">${p}%</td>
                        </tr>
                        `;
                    }).join('');
                }
            }

            const canvas = document.getElementById('branchBreakdownChart');
            if (!canvas) return;
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();

            const ctx = canvas.getContext('2d');

            // Short labels for branch chart (matching reference image)
            const shortLabels = labels.map(l => {
                if (l.includes('Data Science'))       return 'AI & DS';
                if (l.includes('Machine Learning'))   return 'AI & ML';
                if (l.includes('Internet of Things')) return 'IIOT';
                if (l.includes('Automation'))          return 'A & R';
                return l;
            });

            // Compute total for percentage labels
            const totalPlaced = counts.reduce((s, v) => s + v, 0);

            new Chart(ctx, {
                type: 'pie',
                plugins: [ChartDataLabels],
                data: {
                    labels: shortLabels,
                    datasets: [{
                        data: counts,
                        // Order: AI & ML (hot pink), AI & DS (dark purple), IIOT (light purple), A & R (light pink)
                        // The branch_full order from DB: AI&DS, AI&ML, IIOT, A&R
                        // Remap colors to match image 2: DS=dark purple, ML=hot pink, IIOT=lt purple, AR=lt pink
                        backgroundColor: [
                            '#7B1FA2', // AI & DS — dark purple
                            '#E91E8C', // AI & ML — hot pink
                            '#9C59B6', // IIOT — medium purple
                            '#F06292', // A & R — light pink
                        ],
                        borderWidth: 2,
                        borderColor: '#111',
                        hoverOffset: 14
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },   // Labels shown in-slice via datalabels
                        tooltip: {
                            padding: 12,
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            displayColors: true,
                            callbacks: {
                                label: (ctx) => {
                                    const val = ctx.raw;
                                    const pct = totalPlaced > 0 ? Math.round((val / totalPlaced) * 100) : 0;
                                    return ` ${ctx.label}: ${val} Placed (${pct}%)`;
                                }
                            }
                        },
                        datalabels: {
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' },
                            textAlign: 'center',
                            formatter: (value, ctx) => {
                                const label = ctx.chart.data.labels[ctx.dataIndex];
                                const pct = totalPlaced > 0 ? Math.round((value / totalPlaced) * 100) : 0;
                                return `${label}\n${pct}%`;
                            },
                            // Only show label if slice is big enough
                            display: (ctx) => {
                                const value = ctx.dataset.data[ctx.dataIndex];
                                const pct = totalPlaced > 0 ? (value / totalPlaced) * 100 : 0;
                                return pct >= 8;
                            }
                        }
                    }
                }
            });

        } catch (e) {
            console.error('Branch stats error:', e);
        }
    }

    // Toggle Ranking Table
    const toggleRankingBtn = document.getElementById('toggleRankingBtn');
    const fullRankingPanel = document.getElementById('fullRankingPanel');
    if (toggleRankingBtn && fullRankingPanel) {
        toggleRankingBtn.addEventListener('click', () => {
            const isHidden = fullRankingPanel.style.display === 'none';
            fullRankingPanel.style.display = isHidden ? 'block' : 'none';
            toggleRankingBtn.innerHTML = isHidden
                ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M18 15l-6-6-6 6"/></svg> Hide Ranking`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg> View Full Ranking`;
        });
    }

    // Global Filter Initialization (Independent per College)
    const globalFilter = document.getElementById('globalBatchYear');
    
    // Track the last college we synced for to avoid redundant API calls
    let lastSyncedCollege = null;

    async function syncBatchDropdown(forceYear = null) {
        const currentCollege = localStorage.getItem("college") || "USAR";
        if (!globalFilter) return;

        try {
            const res = await window.api.get(`/companies/batches`);
            const batches = res.ok ? await res.json() : [];
            
            // 1. CLEAR & RE-POPULATE (Dynamic Generation)
            globalFilter.innerHTML = batches.length > 0 ? '' : '<option value="">No Data</option>';
            batches.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = `${y} Batch`;
                globalFilter.appendChild(opt);
            });

            // 2. CONTEXT-AWARE DEFAULTING
            // If we have a forced year (from a college switch), use it. 
            // Otherwise, check localStorage but validate it exists in the NEW batch list.
            let activeYear = forceYear || localStorage.getItem("selectedBatchYear");
            
            if (!activeYear || (activeYear !== "" && !batches.includes(activeYear))) {
                activeYear = batches[0] || "";
            }

            localStorage.setItem("selectedBatchYear", activeYear);
            globalFilter.value = activeYear;
            lastSyncedCollege = currentCollege;

            return activeYear;

        } catch (e) {
            console.error("Batch sync failed:", e);
            return "";
        }
    }

    async function loadAnalytics(year = null) {
        // If year is null, it means we might be switching colleges or initializing
        const currentCollege = localStorage.getItem("college") || "USAR";
        
        // Auto-sync dropdown if college changed
        if (lastSyncedCollege !== currentCollege) {
            const syncedYear = await syncBatchDropdown(year);
            // Re-call if we successfully synced a new default year
            if (year === null) year = syncedYear;
        }

        const activeYear = year !== null ? year : (globalFilter?.value || "");

        const loader = document.getElementById("loader");
        if (loader) loader.classList.remove("hidden");

        try {
            // ... API call and population ...
            const response = await window.api.get(`/companies/analytics${activeYear ? '?batch_year=' + activeYear : ''}`);
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const data = await response.json();

            // Populate Cards
            const placementElem = document.getElementById('placementRate');
            const activeElem = document.getElementById('activeCompanies');
            const highestElem = document.getElementById('highestPackage');
            const avgElem = document.getElementById('avgPackage');

            animateValue(placementElem, 0, data.placement_rate || 0, 1000);
            animateValue(activeElem, 0, data.active_companies || 0, 1000);
            animateValue(highestElem, 0, data.highest_package || 0, 1000);
            animateValue(avgElem, 0, data.avg_package || 0, 1000);

            // Render Charts
            renderBatchChart(data.batch_distribution || {});
            renderTypeChart(data.type_distribution || {});
            populateTopCompanies(data.top_companies || []);

            // Detail Data Refresh
            await loadRecruitmentChart(activeYear);
            await loadBranchStats(activeYear);

            // Internship Section Visibility
            const internSection = document.getElementById('internshipSection');
            if (internSection) {
                internSection.style.display = (activeYear === '2025') ? 'block' : 'none';
            }

        } catch (err) {
            console.error('Error loading analytics:', err);
        } finally {
            if (loader) {
                setTimeout(() => {
                    loader.classList.add("hidden");
                }, 500);
            }
        }
    }

    if (globalFilter) {
        globalFilter.addEventListener('change', () => {
            const newYear = globalFilter.value;
            localStorage.setItem("selectedBatchYear", newYear);
            loadAnalytics(newYear);
        });
    }

    // Initial Load
    loadAnalytics();
});
;
