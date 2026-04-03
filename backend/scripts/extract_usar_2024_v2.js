const fs = require('fs');

try {
    const data = fs.readFileSync('c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\dump.json', 'utf8');
    const startIdx = data.indexOf('--- COMPANIES ---');
    if (startIdx === -1) throw new Error('Could not find companies section');
    
    // Find next JSON start [
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
    
    if (jsonEndIdx === -1) throw new Error('Could not find end of companies JSON');
    
    const companiesJson = data.slice(jsonStartIdx, jsonEndIdx);
    const companies = JSON.parse(companiesJson);
    
    const usar2024 = companies.filter(c => c.batch_year === '2024' && c.college === 'USAR');
    
    // Extract unique companies by name and package to avoid confusion, but keep data
    const cleaned = usar2024.map(c => ({
        name: c.company_name,
        batch: 2024,
        role: c.role || 'Software Engineer',
        package: c.package || '0 LPA',
        offers: c.students_placed || 0,
        location: 'India',
        eligibilityText: 'Technology', // Default
        status: 'Completed',
        deadline: 'Finished'
    }));
    
    console.log(JSON.stringify(cleaned, null, 2));
} catch (e) {
    console.error(e.message);
}
