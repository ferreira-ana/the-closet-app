const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/userRoutes');
const authController = require('../../controllers/authController');
const userController = require('../../controllers/userController');

// Mock controllers
jest.mock('../../controllers/authController');
jest.mock('../../controllers/userController');

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use('/api/v1/users', userRoutes);

describe('User Routes', () => {
  test('POST /signup should call authController.signup', async () => {
    authController.signup.mockImplementation((req, res) => {
      res.status(201).json({ status: 'success', data: { user: 'mockUser' } });
    });

    const response = await request(app)
      .post('/api/v1/users/signup')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: 'success',
      data: { user: 'mockUser' },
    });
    expect(authController.signup).toHaveBeenCalled();
  });

  test('POST /login should call authController.login', async () => {
    authController.login.mockImplementation((req, res) => {
      res.status(200).json({ status: 'success', token: 'mockToken' });
    });

    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      token: 'mockToken',
    });
    expect(authController.login).toHaveBeenCalled();
  });

  test('GET / should call userController.getAllUsers', async () => {
    userController.getAllUsers.mockImplementation((req, res) => {
      res.status(200).json({ status: 'success', data: { users: [] } });
    });

    const response = await request(app).get('/api/v1/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { users: [] },
    });
    expect(userController.getAllUsers).toHaveBeenCalled();
  });

  test('GET /:id should call userController.getUser', async () => {
    userController.getUser.mockImplementation((req, res) => {
      res.status(200).json({ status: 'success', data: { user: 'mockUser' } });
    });

    const response = await request(app).get('/api/v1/users/123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { user: 'mockUser' },
    });
    expect(userController.getUser).toHaveBeenCalled();
  });
});
