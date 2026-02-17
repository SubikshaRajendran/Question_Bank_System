// Native fetch used in Node 18+

async function testDebugEmail() {
    const email = 'testuser_debug@gmail.com';
    console.log(`Testing debug email route with: ${email}`);

    try {
        const response = await fetch('http://localhost:3000/api/debug/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error during debug email test:', error);
    }
}

testDebugEmail();
