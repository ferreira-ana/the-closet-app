const jwt = require('jsonwebtoken');
const authController = require('../../controllers/authController');
const AppError = require('../../utils/appError');
const User = require('../../models/userModel');

jest.mock('../../models/userModel');
// ─────────────────────────────────────────────────────────────────────────────
// Tests for signup
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Controller – signup', () => {
  let req, res, next;
  let OLD_ENV;

  beforeAll(() => {
    // preserve and then override env variables
    OLD_ENV = { ...process.env };
    process.env.JWT_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    process.env.JWT_REFRESH_COOKIE_EXPIRES_IN = '7';
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // stub jwt.sign
    jest.spyOn(jwt, 'sign').mockImplementation((payload, secret, opts) => {
      if (secret === process.env.JWT_SECRET) return 'ACCESS_TOKEN';
      if (secret === process.env.JWT_REFRESH_SECRET) return 'REFRESH_TOKEN';
      return 'UNKNOWN';
    });
  });

  afterAll(() => {
    // restore env & stub
    process.env = OLD_ENV;
    jwt.sign.mockRestore();
  });

  beforeEach(() => {
    req = {
      body: {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'pass1234',
        passwordConfirm: 'pass1234',
      },
    };
    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should create a new user and send tokens', async () => {
    // Arrange
    const fakeUser = { _id: 'u1', password: 'secret' };
    User.create.mockResolvedValue(fakeUser);

    // Act
    await authController.signup(req, res, next);

    // Assert: User.create called correctly
    expect(User.create).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'pass1234',
      passwordConfirm: 'pass1234',
    });

    // Assert: refresh cookie gets REFRESH_TOKEN
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshJwt',
      'REFRESH_TOKEN',
      expect.objectContaining({
        httpOnly: true,
        expires: expect.any(Date),
      }),
    );

    // Assert: response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      token: 'ACCESS_TOKEN',
      data: { user: { _id: 'u1', password: undefined } },
    });
  });

  // Production case
  it('sets secure & sameSite on refresh cookie in production', async () => {
    const OLD_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // stub created user
    User.create.mockResolvedValue({ _id: 'u1', password: 'secret' });

    // reuse existing req/res/next from beforeEach
    await authController.signup(req, res, next);

    const [name, value, opts] = res.cookie.mock.calls[0];
    expect(name).toBe('refreshJwt');
    expect(value).toBe('REFRESH_TOKEN'); // if we stub jwt.sign like in other tests
    expect(opts).toEqual(
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        expires: expect.any(Date),
      }),
    );

    process.env.NODE_ENV = OLD_ENV; // restore
  });
  it('lowercases and trims email before creating user', async () => {
    req.body.email = '  Alice@Example.com  ';
    const fakeUser = { _id: 'u1', password: 'secret' };
    User.create.mockResolvedValue(fakeUser);

    await authController.signup(req, res, next);

    expect(User.create).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com', // lowercased + trimmed
      password: 'pass1234',
      passwordConfirm: 'pass1234',
    });
  });

  it('maps duplicate email (code 11000) to AppError 409', async () => {
    User.create.mockRejectedValue({ code: 11000 });

    await authController.signup(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('E11000 duplicate key');
    expect(err.statusCode).toBe(409);
  });

  it('maps ValidationError to AppError 400 with message', async () => {
    const mongoValErr = new Error(
      'User validation failed: passwordConfirm: The Passwords do not match',
    );
    mongoValErr.name = 'ValidationError';
    // (optional) mongoValErr.errors = { passwordConfirm: { message: 'The Passwords do not match' } };

    User.create.mockRejectedValue(mongoValErr);

    await authController.signup(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe(
      'User validation failed: passwordConfirm: The Passwords do not match',
    );
  });
  it('forwards unknown errors to next(err) (generic 500 path)', async () => {
    // Arrange: reject with a non-duplicate, non-validation error
    const unknownErr = new Error('database connection lost');
    unknownErr.name = 'MongoServerError'; // anything that isn't 'ValidationError'
    // no err.code = 11000
    User.create.mockRejectedValue(unknownErr);

    // Act
    await authController.signup(req, res, next);

    // Assert: exact same error is forwarded
    expect(next).toHaveBeenCalledWith(unknownErr);

    // And no response was sent
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for login
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Controller – login', () => {
  let req, res, next;
  let OLD_ENV;

  beforeAll(() => {
    // Preserve and set env for jwt.sign/verify
    OLD_ENV = { ...process.env };
    process.env.JWT_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    // stub jwt.sign so createSendToken in login uses predictable tokens
    jest.spyOn(jwt, 'sign').mockImplementation((payload, secret) => {
      return secret === process.env.JWT_SECRET
        ? 'ACCESS_TOKEN'
        : 'REFRESH_TOKEN';
    });
  });

  afterAll(() => {
    process.env = OLD_ENV;
    jwt.sign.mockRestore();
  });

  beforeEach(() => {
    req = { body: {} };
    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should error 400 if email or password is missing', async () => {
    req.body = { email: '', password: '' };
    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Please provide an email and a password!');
    expect(err.statusCode).toBe(400);
  });

  it('should error 401 if user is not found', async () => {
    // User.findOne(...).select() → resolves to null
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    req.body = { email: 'noone@x.com', password: 'pw' };
    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Incorrect email or password');
    expect(err.statusCode).toBe(401);
  });

  it('should error 401 if password is incorrect', async () => {
    // findOne → user object with correctPassword returning false
    const fakeUser = {
      password: 'hashed',
      correctPassword: jest.fn().mockResolvedValue(false),
    };
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    req.body = { email: 'u@x.com', password: 'wrong' };
    await authController.login(req, res, next);

    expect(fakeUser.correctPassword).toHaveBeenCalledWith('wrong', 'hashed');
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Incorrect email or password');
    expect(err.statusCode).toBe(401);
  });

  it('should login successfully with valid credentials', async () => {
    // findOne → user with correctPassword true
    const fakeUser = {
      _id: 'u1',
      password: 'hashed',
      correctPassword: jest.fn().mockResolvedValue(true),
      changedPasswordAfter: jest.fn().mockReturnValue(false),
    };
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    req.body = { email: 'u@x.com', password: 'right' };
    await authController.login(req, res, next);

    // Should set refresh cookie
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshJwt',
      'REFRESH_TOKEN',
      expect.objectContaining({ httpOnly: true, expires: expect.any(Date) }),
    );
    // Should clear password then respond
    expect(fakeUser.password).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      token: 'ACCESS_TOKEN',
      data: { user: fakeUser },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for logout
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Controller – logout', () => {
  const OLD_ENV = process.env;

  afterEach(() => {
    // restore env after each test
    process.env = { ...OLD_ENV };
  });

  it('clears refreshJwt cookie in non-production (no secure/sameSite)', () => {
    process.env.NODE_ENV = 'test'; // any non-production value

    const req = {};
    const res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authController.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      'refreshJwt',
      expect.objectContaining({
        httpOnly: true,
        // secure and sameSite should not be set in non-production
      }),
    );
    const [, options] = res.clearCookie.mock.calls[0];
    expect(options.secure).toBeUndefined();
    expect(options.sameSite).toBeUndefined();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'success' });
  });

  it('sets secure & sameSite when NODE_ENV=production', () => {
    process.env = { ...OLD_ENV, NODE_ENV: 'production' };

    const req = {};
    const res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authController.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      'refreshJwt',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      }),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'success' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for protect
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Controller – protect', () => {
  let originalVerify;
  beforeAll(() => {
    originalVerify = jwt.verify;
  });
  afterAll(() => {
    jwt.verify = originalVerify;
  });

  let req, res, next;
  beforeEach(() => {
    res = {};
    next = jest.fn();
  });

  it('errors if no Authorization header', async () => {
    req = { headers: {} };
    await authController.protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe(
      'You are not logged in! Please log in to get access.',
    );
    expect(err.statusCode).toBe(401);
  });

  it('errors on invalid token', async () => {
    req = { headers: { authorization: 'Bearer bad' } };
    jwt.verify = jest.fn((token, secret, cb) => cb(new Error('fail')));
    await authController.protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Invalid token.');
    expect(err.statusCode).toBe(401);
  });

  it('errors on expired token', async () => {
    req = { headers: { authorization: 'Bearer expired' } };
    const expiredErr = new Error('expired');
    expiredErr.name = 'TokenExpiredError';
    jwt.verify = jest.fn((token, secret, cb) => cb(expiredErr));
    await authController.protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Access token expired. Please refresh.');
    expect(err.statusCode).toBe(401);
  });

  it('errors if user no longer exists', async () => {
    req = { headers: { authorization: 'Bearer good' } };
    // simulate successful verify
    jwt.verify = jest.fn((t, s, cb) => cb(null, { id: 'u1', iat: 1000 }));
    User.findById.mockResolvedValue(null);

    await authController.protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe(
      'The user belonging to this token no longer exists.',
    );
    expect(err.statusCode).toBe(401);
  });

  it('errors if password changed after iat', async () => {
    req = { headers: { authorization: 'Bearer good' } };
    jwt.verify = jest.fn((t, s, cb) => cb(null, { id: 'u1', iat: 1000 }));
    User.findById.mockResolvedValue({
      changedPasswordAfter: jest.fn().mockReturnValue(true),
    });

    await authController.protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe(
      'User recently changed password! Please log in again.',
    );
    expect(err.statusCode).toBe(401);
  });

  it('grants access when token and user are valid', async () => {
    req = { headers: { authorization: 'Bearer good' } };
    jwt.verify = jest.fn((t, s, cb) => cb(null, { id: 'u1', iat: 1000 }));
    const mockUser = { changedPasswordAfter: jest.fn().mockReturnValue(false) };
    User.findById.mockResolvedValue(mockUser);

    await authController.protect(req, res, next);

    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalledWith();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for refreshToken
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth Controller – refreshToken', () => {
  let OLD_ENV;

  beforeAll(() => {
    // 1) Preserve and set distinct secrets:
    OLD_ENV = { ...process.env };
    process.env.JWT_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    process.env.JWT_REFRESH_COOKIE_EXPIRES_IN = '7'; // so we get a Date

    // 2) Stub jwt.sign so ACCESS vs REFRESH are unambiguous
    jest.spyOn(jwt, 'sign').mockImplementation((payload, secret) => {
      return secret === process.env.JWT_SECRET ? 'NEW_ACCESS' : 'NEW_REFRESH';
    });
  });

  afterAll(() => {
    // Restore both env and stub:
    process.env = OLD_ENV;
    jwt.sign.mockRestore();
  });

  let req, res, next;
  beforeEach(() => {
    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();
  });

  it('returns 204 when no refreshJwt cookie (no-op)', async () => {
    req = { cookies: {} };
    await authController.refreshToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('errors when token verification fails', async () => {
    const verifyErr = new Error('bad');
    jwt.verify = jest.fn((t, s, cb) => cb(verifyErr));
    req = { cookies: { refreshJwt: 'token' } };

    await authController.refreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(verifyErr);
  });

  it('401 when refresh token is expired/invalid (JWT named error)', async () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError'; // or 'JsonWebTokenError'
    jwt.verify = jest.fn((t, s, cb) => cb(err));
    req = { cookies: { refreshJwt: 'token' } };

    await authController.refreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const passed = next.mock.calls[0][0];
    expect(passed.message).toBe('Refresh token invalid or expired.');
    expect(passed.statusCode).toBe(401);
  });

  it('errors when user not found after verify', async () => {
    jwt.verify = jest.fn((t, s, cb) => cb(null, { id: 'u1' }));
    User.findById.mockResolvedValue(null);
    req = { cookies: { refreshJwt: 'token' } };

    await authController.refreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('User not found.');
    expect(err.statusCode).toBe(401);
  });

  it('refreshes tokens when cookie and user are valid', async () => {
    jwt.verify = jest.fn((t, s, cb) => cb(null, { id: 'u1' }));
    const user = {};
    User.findById.mockResolvedValue(user);
    req = { cookies: { refreshJwt: 'token' } };

    await authController.refreshToken(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshJwt',
      'NEW_REFRESH',
      expect.objectContaining({ httpOnly: true, expires: expect.any(Date) }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      token: 'NEW_ACCESS',
      data: { user },
    });
  });
});
