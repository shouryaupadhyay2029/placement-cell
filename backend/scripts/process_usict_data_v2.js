const fs = require('fs');

function parsePackage(pkgStr) {
    if (!pkgStr || typeof pkgStr !== 'string') return { avg: 0, high: 0 };
    
    // Remove " LPA" and other text
    let clean = pkgStr.replace(/LPA/gi, '').trim();
    
    // Handle ranges like "18-24"
    if (clean.includes('-')) {
        let parts = clean.split('-').map(p => parseFloat(p.replace(/[^\d.]/g, ''))).filter(p => !isNaN(p));
        if (parts.length >= 2) {
            return { avg: (parts[0] + parts[1]) / 2, high: parts[1] };
        } else if (parts.length === 1) {
            return { avg: parts[0], high: parts[0] };
        }
    }
    
    // Handle "3 to 5"
    if (clean.toLowerCase().includes(' to ')) {
        let parts = clean.toLowerCase().split(' to ').map(p => parseFloat(p.replace(/[^\d.]/g, ''))).filter(p => !isNaN(p));
        if (parts.length >= 2) {
            return { avg: (parts[0] + parts[1]) / 2, high: parts[1] };
        }
    }

    // Default numeric extraction
    let val = parseFloat(clean.replace(/[^\d.]/g, ''));
    if (isNaN(val)) return { avg: 0, high: 0 };
    return { avg: val, high: val };
}

try {
    const data = fs.readFileSync('c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\dump.json', 'utf8');
    const startIdx = data.indexOf('--- COMPANIES ---');
    const jsonStartIdx = data.indexOf('[', startIdx);
    let bracketCount = 0;
    let jsonEndIdx = -1;
    for (let i = jsonStartIdx; i < data.length; i++) {
        if (data[i] === '[') bracketCount++;
        else if (data[i] === ']') bracketCount--;
        if (bracketCount === 0) {
            jsonEndIdx = i + 1;
            break;
        }
    }
    const companies = JSON.parse(data.slice(jsonStartIdx, jsonEndIdx));
    const usictCompanies = companies.filter(c => c.college === 'USICT');

    const result = {};
    const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

    years.forEach(year => {
        const yearCompanies = usictCompanies.filter(c => c.batch_year === year);
        if (yearCompanies.length === 0) {
            result[year] = { summary: {
                companiesVisited: 0,
                studentsPlaced: 0,
                totalOffers: 0,
                highestPackage: 0,
                averagePackage: 0,
                medianPackage: 0,
                internships: 0,
                ppo: 0
            }, companies: [], eligibility: [], analytics: {
                branchStats: [],
                packageDistribution: [],
                topCompanies: []
            } };
            return;
        }

        const mappedCompanies = yearCompanies.map(c => ({
            name: c.company_name,
            batch: parseInt(year),
            role: c.role || "Software Engineer",
            package: c.package || "0 LPA",
            offers: c.students_placed || 0,
            location: "India",
            eligibilityText: "Technology",
            status: "Completed",
            deadline: "Finished"
        }));

        let highest = 0;
        let totalVal = 0;
        let countOffers = 0;
        const packages = [];

        mappedCompanies.forEach(c => {
            const { avg, high } = parsePackage(c.package);
            if (high > highest) highest = high;
            if (c.offers > 0) {
                totalVal += avg * c.offers;
                countOffers += c.offers;
                for(let i=0; i<c.offers; i++) packages.push(avg);
            }
        });

        const average = countOffers > 0 ? (totalVal / countOffers).toFixed(2) : 0;
        packages.sort((a, b) => a - b);
        const median = packages.length > 0 ? packages[Math.floor(packages.length / 2)] : 0;

        const dist = [
            { range: "20+ LPA", count: packages.filter(p => p >= 20).length },
            { range: "10-20 LPA", count: packages.filter(p => p >= 10 && p < 20).length },
            { range: "5-10 LPA", count: packages.filter(p => p >= 5 && p < 10).length },
            { range: "0-5 LPA", count: packages.filter(p => p < 5).length }
        ];

        const top = [...mappedCompanies]
            .map(c => ({ ...c, sortVal: parsePackage(c.package).high }))
            .sort((a, b) => b.sortVal - a.sortVal)
            .slice(0, 5)
            .map(c => ({ name: c.name, package: c.package }));

        result[year] = {
            summary: {
                companiesVisited: mappedCompanies.length,
                studentsPlaced: countOffers,
                totalOffers: countOffers,
                highestPackage: highest,
                averagePackage: parseFloat(average),
                medianPackage: median,
                internships: 0,
                ppo: 0
            },
            companies: mappedCompanies,
            eligibility: [],
            analytics: {
                branchStats: [],
                packageDistribution: dist,
                topCompanies: top
            }
        };
    });

    fs.writeFileSync('c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\scripts\\usict_historical_data_v2.json', JSON.stringify(result, null, 2));
    console.log('✅ Success');
} catch (e) {
    console.error(e.message);
}
