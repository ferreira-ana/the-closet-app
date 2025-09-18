const AppError = require('../../utils/appError');

describe('AppError Class', () => {
  test('should create an error with message and statusCode', () => {
    const err = new AppError('Something failed', 404);

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Something failed');
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  test('should default to 500 and generic message if not provided', () => {
    const err = new AppError();

    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');
  });
});
