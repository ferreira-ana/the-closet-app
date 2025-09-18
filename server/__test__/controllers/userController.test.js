// Mock fs/promises so we control unlink behavior
jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));
const fs = require('fs/promises');

// Mock models
jest.mock('../../models/userModel');
jest.mock('../../models/closetModel');

const User = require('../../models/userModel');
const Closet = require('../../models/closetModel');

// ─────────────────────────────────────────────────────────────────────────────
// Import controller
// ─────────────────────────────────────────────────────────────────────────────
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deleteMe,
} = require('../../controllers/userController');

beforeAll(() => {
  // silence error logs from deleteMe’s swallow branch
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for getAllUsers
// ─────────────────────────────────────────────────────────────────────────────
describe('getAllUsers', () => {
  it('returns a list of users with 200', async () => {
    const fakeUsers = [{ _id: 'u1' }, { _id: 'u2' }];
    User.find.mockResolvedValue(fakeUsers);

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await getAllUsers(req, res, next);

    expect(User.find).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: fakeUsers.length,
      data: { users: fakeUsers },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next(err) when User.find throws', async () => {
    const error1 = new Error('db down');
    User.find.mockRejectedValue(error1);

    const req = {};
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    await getAllUsers(req, res, next);

    expect(next).toHaveBeenCalledWith(error1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for routes that have not been implemented yet
// ─────────────────────────────────────────────────────────────────────────────
describe('not implemented routes', () => {
  function makeRes() {
    return { status: jest.fn().mockReturnThis(), json: jest.fn() };
  }

  it('getUser returns 501', () => {
    const res = makeRes();
    getUser({}, res);
    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'This route is not implemented',
    });
  });

  it('createUser returns 501', () => {
    const res = makeRes();
    createUser({}, res);
    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'This route is not implemented',
    });
  });

  it('updateUser returns 501', () => {
    const res = makeRes();
    updateUser({}, res);
    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'This route is not implemented',
    });
  });

  it('deleteUser returns 501', () => {
    const res = makeRes();
    deleteUser({}, res);
    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'This route is not implemented',
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for deleteMe a function to delete the user's own account
// ─────────────────────────────────────────────────────────────────────────────
describe('deleteMe', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'u123' } };
    res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    next = jest.fn();
  });

  it('deletes user images (swallowing unlink errors), closets, user; clears cookie; 204', async () => {
    // Closet items (one without photo to ensure skip path)
    Closet.find.mockResolvedValue([
      { photo: 'uploads/private/img/closet/a.jpg' },
      { photo: null },
      { photo: 'uploads/private/img/closet/b.jpg' },
    ]);

    // First unlink ok, second fails → should be swallowed
    fs.unlink
      .mockResolvedValueOnce(undefined) // a.jpg
      .mockRejectedValueOnce(new Error('cannot unlink b.jpg')); // b.jpg

    Closet.deleteMany.mockResolvedValue({ deletedCount: 2 });
    User.findByIdAndDelete.mockResolvedValue({ _id: 'u123' });

    await deleteMe(req, res, next);

    // Unlink called only for items with a photo
    expect(fs.unlink).toHaveBeenCalledTimes(2);
    const calledPaths = fs.unlink.mock.calls.map((c) =>
      String(c[0]).replace(/\\/g, '/'),
    );
    expect(calledPaths[0]).toContain('uploads/private/img/closet/a.jpg');
    expect(calledPaths[1]).toContain('uploads/private/img/closet/b.jpg');

    // DB deletions
    expect(Closet.deleteMany).toHaveBeenCalledWith({ user: 'u123' });
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('u123');

    // Clear cookie + 204
    expect(res.clearCookie).toHaveBeenCalledWith('refreshJwt');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();

    // No error surfaced
    expect(next).not.toHaveBeenCalled();
  });

  it('handles no closets gracefully', async () => {
    Closet.find.mockResolvedValue([]);
    Closet.deleteMany.mockResolvedValue({ deletedCount: 0 });
    User.findByIdAndDelete.mockResolvedValue({ _id: 'u123' });

    await deleteMe(req, res, next);

    expect(fs.unlink).not.toHaveBeenCalled();
    expect(Closet.deleteMany).toHaveBeenCalledWith({ user: 'u123' });
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('u123');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshJwt');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
