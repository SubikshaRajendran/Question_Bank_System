async function testRegistration() {
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@gmail.com`;
    console.log(`Attempting to register with email: ${email}`);

    try {
        const response = await fetch('http://localhost:3000/api/auth/student/register-init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', data);

        if (response.status === 200 && data.success) {
            console.log('SUCCESS: Registration initiated for non-domain email.');
        } else {
            console.log('FAILURE: Registration failed.');
        }

    } catch (error) {
        console.error('Error during test:', error);
    }
}

testRegistration();
