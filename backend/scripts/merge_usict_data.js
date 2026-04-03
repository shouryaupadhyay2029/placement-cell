const fs = require('fs');
const path = require('path');

try {
    const historicalPath = 'c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\scripts\\usict_historical_data_v2.json';
    const currentDataPath = 'c:\\Users\\Shourya Upadhyay\\OneDrive\\Documents\\ALL CODES\\PROJECT\\placement-cell\\backend\\data\\data.json';

    const historicalData = JSON.parse(fs.readFileSync(historicalPath, 'utf8'));
    const currentData = JSON.parse(fs.readFileSync(currentDataPath, 'utf8'));

    // Update USICT data
    currentData.USICT = historicalData;

    fs.writeFileSync(currentDataPath, JSON.stringify(currentData, null, 2));
    console.log('✅ Merge Success');
} catch (e) {
    console.error(e.message);
}
