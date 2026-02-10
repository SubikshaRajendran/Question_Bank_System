const http = require('http');

const post = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body, error: 'JSON Parse Error' });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
};

const run = async () => {
    try {
        console.log('--- Testing Admin Login ---');
        const adminData = JSON.stringify({ email: 'adminbit@gmail.com', password: 'bitqb' });
        const adminRes = await post('/api/auth/admin/login', adminData);
        console.log('Status:', adminRes.status);
        console.log('Response:', adminRes.body);

        console.log('\n--- Testing Student Login ---');
        const studentData = JSON.stringify({ email: 'teststudent@gmail.com', password: 'password123' });
        const studentRes = await post('/api/auth/student/login', studentData);
        console.log('Status:', studentRes.status);
        console.log('Response:', studentRes.body);

    } catch (err) {
        console.error('Test Failed:', err);
    }
};

run();
