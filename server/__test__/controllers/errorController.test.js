const errorHandler = require('../../controllers/errorController');
const AppError = require('../../utils/appError');

describe('errorController', () => {
  let OLD_ENV;
  let res, next, req;

  beforeAll(() => {
    OLD_ENV = { ...process.env };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.error.mockRestore();
  });

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    req = {};
    jest.clearAllMocks();
  });

  describe('development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('returns full error details with 500 by default', () => {
      const err = new Error('full error details');
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const payload = res.json.mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          status: 'error',
          message: 'full error details',
        }),
      );
      expect(payload.error).toBe(err);
      expect(typeof payload.stack).toBe('string');
    });
  });

  describe('production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('sends operational AppError message to client', () => {
      const err = new AppError('Not found', 404);
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: err.status, // usually "fail"
          message: 'Not found',
        }),
      );
    });

    it('handles CastError as 400 with formatted message', () => {
      const err = { name: 'CastError', path: 'id', value: '123' };
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail', // generated AppError.status
        message: 'Invalid id:123.',
      });
    });

    it('handles duplicate key (code 11000) and extracts quoted value', () => {
      const err = {
        code: 11000,
        errmsg:
          'E11000 duplicate key error dup key: { email: "alice@example.com" }',
      };
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message:
          'Duplicate field value: "alice@example.com". Please use another value!',
      });
    });

    it('handles ValidationError and joins messages', () => {
      const err = {
        name: 'ValidationError',
        errors: {
          a: { message: 'A is invalid' },
          b: { message: 'B is missing' },
        },
      };
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid input data. A is invalid. B is missing',
      });
    });

    it('handles JWT invalid token', () => {
      const err = { name: 'JsonWebTokenError' };
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid token. Please log in again!',
      });
    });

    it('handles JWT expired token', () => {
      const err = { name: 'TokenExpiredError' };
      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Your session has expired. Please log in again!',
      });
    });

    it('logs and hides non-operational errors', () => {
      const err = new Error('non-operational-error'); // not operational
      errorHandler(err, req, res, next);

      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
      });
    });
  });
});
