const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/companies/analytics?batch_year=2024', {
            headers: { 'x-college': 'USAR' }
        });
        console.log('SUCCESS:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('ERROR:', err.response?.data || err.message);
    }
}

test();
