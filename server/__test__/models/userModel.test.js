const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs');

describe('User model schema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const base = {
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password1',
    passwordConfirm: 'password1',
  };

  it('accepts a valid user', () => {
    const user = new User(base);
    const err = user.validateSync();
    expect(err).toBeUndefined();
  });

  it('requires name', () => {
    const user = new User({ ...base, name: undefined });
    const err = user.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.name.message).toBe('Please insert your name');
  });

  it('requires email', () => {
    const user = new User({ ...base, email: undefined });
    const err = user.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.email.message).toBe('Please insert your email address');
  });

  it('rejects invalid email format', () => {
    const user = new User({ ...base, email: 'not-an-email' });
    const err = user.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.email.message).toBe('Please provide a valid email');
  });

  it('lowercases email', () => {
    const user = new User({ ...base, email: 'ALICE@EXAMPLE.COM' });
    // lowercasing happens as a setter, so it should be lower now
    expect(user.email).toBe('alice@example.com');
  });

  it('requires password (minlength 8)', () => {
    // we simulate a missing password
    const missingPassword = new User({ ...base, password: undefined });
    let err = missingPassword.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.password.message).toBe('Please provide a password');

    // too short
    const short = new User({
      ...base,
      password: 'short',
      passwordConfirm: 'short',
    });
    err = short.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.password.kind).toBe('minlength');
  });

  it('requires passwordConfirm', () => {
    const user = new User({ ...base, passwordConfirm: undefined });
    const err = user.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.passwordConfirm.message).toBe(
      'Please confirm your password',
    );
  });

  it('rejects when passwordConfirm does not match password', () => {
    const user = new User({ ...base, passwordConfirm: 'different' });
    const err = user.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.passwordConfirm.message).toBe(
      'The Passwords do not match',
    );
  });

  describe('instance methods', () => {
    it('correctPassword delegates to bcrypt.compare (true case)', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const doc = new User(base);
      const ok = await doc.correctPassword('candidate', 'hashed');
      expect(bcrypt.compare).toHaveBeenCalledWith('candidate', 'hashed');
      expect(ok).toBe(true);
    });

    it('correctPassword delegates to bcrypt.compare (false case)', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const doc = new User(base);
      const ok = await doc.correctPassword('candidate', 'hashed');
      expect(bcrypt.compare).toHaveBeenCalledWith('candidate', 'hashed');
      expect(ok).toBe(false);
    });

    it('changedPasswordAfter returns false when passwordChangedAt not set', () => {
      const doc = new User(base);
      expect(doc.changedPasswordAfter(1_000_000)).toBe(false);
    });

    it('changedPasswordAfter returns true when changed after JWT iat', () => {
      const doc = new User(base);
      // password changed at t = 2000 (seconds)
      doc.passwordChangedAt = new Date(2000 * 1000);
      // JWT issued at t = 1000
      expect(doc.changedPasswordAfter(1000)).toBe(true);
    });

    it('changedPasswordAfter returns false when changed before JWT iat', () => {
      const doc = new User(base);
      doc.passwordChangedAt = new Date(500 * 1000);
      expect(doc.changedPasswordAfter(1000)).toBe(false);
    });
  });
});
