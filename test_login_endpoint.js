const http = require('http');

const data = JSON.stringify({
    username: 'adminbitqbs',
    password: 'bitqb'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/admin/login', // Check if path prefix is correct. server.js usually maps routes.
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

// Check server.js for route prefix. 
// If app.use('/api/auth', authRoutes) -> then /api/auth/admin/login
// If app.use('/auth', authRoutes) -> then /auth/admin/login/

// Let's assume /auth/admin/login based on routes/auth.js
// But usually there is a prefix in server.js

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log('BODY:', body));
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
