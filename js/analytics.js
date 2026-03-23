document.addEventListener('DOMContentLoaded', async () => {
    // Shared PlacePro Theme Colors Configuration
    const primaryColor = '#facc15';
    const surfaceColor = 'rgba(20, 20, 20, 0.8)';
    const textColor = '#f8f8f8';
    const gridColor = 'rgba(250, 204, 21, 0.1)';
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
            // 1. Fetch Main Stats
            const response = await fetch(`http://127.0.0.1:5000/api/analytics${year ? '?batch_year=' + year : ''}`);
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

            // 4. Load Recruitment Chart (Company-wise counts)
            await loadRecruitmentChart(year);

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
                    backgroundColor: [primaryColor, '#eab308', '#ca8a04', '#a16207', '#854d0e', surfaceColor],
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
                    backgroundColor: '#eab308',
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
            const url = `http://127.0.0.1:5000/api/company-recruitment${batchYear ? '?batch_year=' + batchYear : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            const companies = data.companies || [];
            const placed    = data.students_placed || [];
            const total     = data.total_placed || 0;

            const label = document.getElementById('totalPlacedLabel');
            if (label) label.textContent = `Total Students Placed: ${total}`;

            const chartTitle = document.getElementById('recruitmentChartTitle');
            if (chartTitle) {
                chartTitle.textContent = batchYear 
                    ? `Company-wise Recruitment (${batchYear} Batch)` 
                    : `Overall Company-wise Recruitment`;
            }

            const ctx = document.getElementById('companyRecruitmentChart');
            if (!ctx) return;
            if (recruitmentChart) recruitmentChart.destroy();

            recruitmentChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: companies,
                    datasets: [{
                        label: 'Students Placed',
                        data: placed,
                        backgroundColor: companies.map((_, i) => i % 2 === 0 ? primaryColor : '#eab308'),
                        borderRadius: 6,
                        barPercentage: 0.65,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: tooltipBg,
                            padding: 10,
                            callbacks: { label: ctx => ` ${ctx.parsed.y} students placed` }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { stepSize: 1 } },
                        x: { grid: { display: false }, ticks: { maxRotation: 40, minRotation: 20, font: { size: 11 } } }
                    }
                }
            });
        } catch (e) {
            console.error('Recruitment chart error:', e);
        }
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
