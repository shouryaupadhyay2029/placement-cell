document.addEventListener('DOMContentLoaded', async () => {
    // Shared PlacePro Theme Colors Configuration
    const primaryColor = '#10b981';
    const surfaceColor = 'rgba(20, 20, 20, 0.8)';
    const textColor = '#f8f8f8';
    const gridColor = 'rgba(16, 185, 129, 0.1)';
    const tooltipBg = 'rgba(0, 0, 0, 0.8)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Poppins', sans-serif";

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
    let locChart = null;
    let recruitmentChart = null;

    async function loadAnalytics(year = '') {
        try {
            // 1. Fetch Main Stats from Node.js
            const response = await fetch(`http://localhost:5000/companies/analytics${year ? '?batch_year=' + year : ''}`);
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
            renderTypeChart(data.type_distribution || {});
            renderLocationChart(data.location_distribution || {});
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

        let keys = Object.keys(typeDist);
        let values = keys.map(k => typeDist[k]);
        if (keys.length === 0) { keys = ['No Data']; values = [1]; }

        typeChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: keys,
                datasets: [{
                    data: values,
                    backgroundColor: [primaryColor, '#10b981', '#059669', '#064e3b', '#064e3b', surfaceColor],
                    borderWidth: 2,
                    borderColor: '#111'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'right', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } }
                }
            }
        });
    }

    function renderLocationChart(locDist) {
        const ctx = document.getElementById('locationChart');
        if (!ctx) return;
        if (locChart) locChart.destroy();

        let keys = Object.keys(locDist);
        keys.sort((a, b) => locDist[b] - locDist[a]);
        let topKeys = keys.slice(0, 5);
        let topValues = topKeys.map(k => locDist[k]);
        if (topKeys.length === 0) { topKeys = ['No Data']; topValues = [0]; }

        locChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topKeys,
                datasets: [{
                    label: 'Companies',
                    data: topValues,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: gridColor }, ticks: { stepSize: 1 } },
                    y: { grid: { display: false } }
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
            const url = `http://localhost:5000/companies/recruitment${batchYear ? '?batch_year=' + batchYear : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            // Filter out companies with 0 recruitment for a cleaner ranking/chart
            const filteredIndices = (data.students_placed || []).map((v, i) => v > 0 ? i : -1).filter(i => i !== -1);
            const allCompanies = filteredIndices.map(i => data.companies[i]);
            const allPlaced = filteredIndices.map(i => data.students_placed[i]);
            const allTypes = filteredIndices.map(i => data.company_types[i] || "—");
            const allLocations = filteredIndices.map(i => data.company_locations[i] || "—");
            const total = data.total_placed || 0;

            const label = document.getElementById('totalPlacedLabel');
            if (label) label.textContent = `Total Placed: ${total}`;

            // Store data for view switching
            window.recruitmentData = { 
                companies: allCompanies, 
                placed: allPlaced, 
                types: allTypes,
                locations: allLocations,
                total: total,
                batchYear: batchYear
            };

            // Populate Full Ranking Table
            const rankingBody = document.getElementById('fullRankingBody');
            if (rankingBody) {
                rankingBody.innerHTML = allCompanies.map((name, i) => {
                    const count = allPlaced[i];
                    const type = allTypes[i];
                    const loc = allLocations[i];
                    const share = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    return `
                        <tr>
                            <td><strong>#${i + 1}</strong></td>
                            <td style="font-weight:600;">${name}</td>
                            <td><span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);">${type}</span></td>
                            <td style="opacity:0.8;">${loc}</td>
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
                            callback: function(value) {
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
        try {
            const url = `http://localhost:5000/companies/branch-stats${batchYear ? '?batch_year=' + batchYear : ''}`;
            const res = await fetch(url);
            const data = await res.json();

            const labels = data.labels || [];
            const counts = data.counts || [];
            const total = data.total || 0;

            const totalLabel = document.getElementById('branchTotalLabel');
            if (totalLabel) totalLabel.innerText = `${total} Selected Students Mapped by Branch`;

            // Populate Table
            const body = document.getElementById('branchStatsBody');
            if (body) {
                body.innerHTML = labels.map((b, i) => {
                    const c = counts[i];
                    const p = total > 0 ? ((c/total)*100).toFixed(1) : 0;
                    return `
                        <tr>
                            <td style="font-weight:600;">${b}</td>
                            <td style="color:var(--primary); font-weight:700;">${c}</td>
                            <td style="opacity:0.6;">${p}%</td>
                        </tr>
                    `;
                }).join('');
            }

            // Render Donut Chart
            const canvas = document.getElementById('branchBreakdownChart');
            if (!canvas) return;

            // Clear previous if any
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();

            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.9)', // AI-DS
                            'rgba(16, 185, 129, 0.7)', // AI-ML
                            'rgba(16, 185, 129, 0.5)', // IIOT
                            'rgba(16, 185, 129, 0.3)'  // A&R
                        ],
                        hoverBackgroundColor: 'var(--primary)',
                        borderWidth: 0,
                        hoverOffset: 12,
                        borderRadius: 4,
                        spacing: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                padding: 25,
                                font: { size: 12, weight: '500' },
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            padding: 12,
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            borderColor: 'rgba(16,185,129,0.2)',
                            borderWidth: 1,
                            displayColors: false,
                            callbacks: {
                                label: (ctx) => {
                                    const val = ctx.raw;
                                    const per = total > 0 ? ((val/total)*100).toFixed(1) : 0;
                                    return ` ${val} Candidates (${per}%)`;
                                }
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

    // Global Filter Listener
    const globalFilter = document.getElementById('globalBatchYear');
    if (globalFilter) {
        // 1. Restore year from localStorage
        const storedYear = localStorage.getItem("selectedBatchYear") || "";
        globalFilter.value = storedYear;

        globalFilter.addEventListener('change', () => {
            const newYear = globalFilter.value;
            localStorage.setItem("selectedBatchYear", newYear);
            loadAnalytics(newYear);
        });

        // 2. Initial Load with stored year
        loadAnalytics(storedYear);
    } else {
        // Fallback or Initial Load if filter not present
        loadAnalytics('');
    }
});
;
