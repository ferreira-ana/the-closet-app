const catchAsync = require('../../utils/catchAsync');

describe('catchAsync Utility', () => {
  test('should call the passed function and handle errors', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Test Error'));
    const next = jest.fn();

    const wrappedFn = catchAsync(mockFn);
    await wrappedFn({}, {}, next);

    expect(mockFn).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Test Error');
  });
});
