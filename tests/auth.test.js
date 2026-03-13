const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Authentication API', () => {
    // Close DB connection after tests to prevent handle leaks
    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Admin Authentication', () => {
        it('should fail to login with missing admin credentials', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({});
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should fail to login with incorrect admin username', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'wrongadmin', password: 'password' });
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid Admin Username');
        });
    });

    describe('Student Authentication', () => {
        it('should fail to login with non-existent student email', async () => {
            const res = await request(app)
                .post('/api/auth/student/login')
                .send({ email: 'unknown@example.com', password: 'password123' });
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message', 'User not found. Please register first.');
        });

        it('should fail to login with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/student/login')
                .send({ email: 'test@example.com' });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Email and password required');
        });
    });
});
