const fs = require('fs');

try {
    const data = fs.readFileSync('c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\dump.json', 'utf8');
    const startIdx = data.indexOf('--- COMPANIES ---');
    if (startIdx === -1) throw new Error('Could not find companies section');
    
    // Find next JSON start [
    const jsonStartIdx = data.indexOf('[', startIdx);
    // Find next JSON end ] matched
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
    console.log(JSON.stringify(usar2024, null, 2));
} catch (e) {
    console.error(e);
}
