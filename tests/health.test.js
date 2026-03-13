const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Health Check API', () => {
    // Close DB connection after tests to prevent handle leaks
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return 200 OK for /api/health', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message', 'Backend is running');
    });

    it('should return 404 for non-existent API routes', async () => {
        const res = await request(app).get('/api/non-existent-route');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'API endpoint not found');
    });
});
