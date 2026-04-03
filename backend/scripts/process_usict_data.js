const fs = require('fs');

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
            result[year] = { summary: {}, companies: [], eligibility: [], analytics: {} };
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

        // Summary calculations
        const studentsPlaced = mappedCompanies.reduce((sum, c) => sum + (c.offers || 0), 0);
        
        let highest = 0;
        let totalVal = 0;
        let countVal = 0;
        const packages = [];

        mappedCompanies.forEach(c => {
            const pkgStr = c.package || "";
            // Extract numeric value from "X.Y LPA" or "X-Y LPA"
            let val = parseFloat(pkgStr.replace(/[^\d.]/g, ''));
            if (!isNaN(val)) {
                if (val > highest) highest = val;
                if (c.offers > 0) {
                    totalVal += val * c.offers;
                    countVal += c.offers;
                    for(let i=0; i<c.offers; i++) packages.push(val);
                }
            }
        });

        const average = countVal > 0 ? (totalVal / countVal).toFixed(2) : 0;
        packages.sort((a, b) => a - b);
        const median = packages.length > 0 ? packages[Math.floor(packages.length / 2)] : 0;

        // Package Distribution
        const dist = [
            { range: "20+ LPA", count: packages.filter(p => p >= 20).length },
            { range: "10-20 LPA", count: packages.filter(p => p >= 10 && p < 20).length },
            { range: "5-10 LPA", count: packages.filter(p => p >= 5 && p < 10).length },
            { range: "0-5 LPA", count: packages.filter(p => p < 5).length }
        ];

        // Top Companies
        const top = [...mappedCompanies]
            .sort((a, b) => {
                const va = parseFloat(a.package.replace(/[^\d.]/g, '')) || 0;
                const vb = parseFloat(b.package.replace(/[^\d.]/g, '')) || 0;
                return vb - va;
            })
            .slice(0, 5)
            .map(c => ({ name: c.name, package: c.package }));

        result[year] = {
            summary: {
                companiesVisited: mappedCompanies.length,
                studentsPlaced: studentsPlaced,
                totalOffers: studentsPlaced,
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

    fs.writeFileSync('c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\scripts\\usict_historical_data.json', JSON.stringify(result, null, 2));
    console.log('✅ Success');
} catch (e) {
    console.error(e.message);
}
