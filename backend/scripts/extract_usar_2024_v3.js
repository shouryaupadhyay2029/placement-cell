const fs = require('fs');
const path = require('path');

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
    const usar2024 = companies.filter(c => c.batch_year === '2024' && c.college === 'USAR');
    
    const cleaned = usar2024.map(c => ({
        name: c.company_name,
        batch: 2024,
        role: c.role || 'Software Engineer',
        package: c.package || '0 LPA',
        offers: c.students_placed || 0,
        location: 'India',
        eligibilityText: 'Technology',
        status: 'Completed',
        deadline: 'Finished'
    }));
    
    fs.writeFileSync('c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\scripts\\usar2024_data.json', JSON.stringify(cleaned, null, 2));
    console.log('✅ Success');
} catch (e) {
    console.error(e.message);
}
