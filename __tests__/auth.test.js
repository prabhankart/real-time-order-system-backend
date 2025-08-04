const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // We need to export 'app' from server.js
const User = require('../api/models/User');

// Connect to a test database before running tests
beforeAll(async () => {
    const url = `mongodb://127.0.0.1/test-db`;
    await mongoose.connect(url, { useNewUrlParser: true });
});

// Clear the user collection after each test
afterEach(async () => {
    await User.deleteMany();
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth API', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(201);
        expect(res.text).toBe('User registered successfully.');
    });

    it('should log in an existing user', async () => {
        // First, create a user to log in with
        const user = new User({ email: 'login@example.com', password: 'password123' });
        await user.save();

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});