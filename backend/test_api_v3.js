async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/companies/analytics?batch_year=2024', {
            headers: { 'x-college': 'USAR' }
        });
        const data = await response.json();
        console.log('STATUS:', response.status);
        console.log('DATA:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('FETCH ERROR:', err.message);
    }
}

test();
