// ─────────────────────────────────────────────────────────────────────────────
// Mock out fs/promises so we control both `unlink` and `access`
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
  access: jest.fn().mockResolvedValue(undefined),
}));
// ─────────────────────────────────────────────────────────────────────────────
// We'll spy on fs.createReadStream at runtime, and tell sharp() at runtime
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('sharp');

// ─────────────────────────────────────────────────────────────────────────────
// Mock fs.createReadStream at module-load time
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    createReadStream: jest.fn(), // will wire return in beforeEach
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Import the controller (after all the mocks are in place)
// ─────────────────────────────────────────────────────────────────────────────
const {
  createCloset,
  updateCloset,
  getClosets,
  getCloset,
  deleteCloset,
  serveClosetImage,
  normalizeListInput,
  _multerFilter,
  _multerDestination,
  _multerFilename,
} = require('../../controllers/closetController');
const Closet = require('../../models/closetModel');
const AppError = require('../../utils/appError');

const fs = require('fs/promises');
const path = require('path');
jest.mock('../../models/closetModel');

// now we pull in the real fs and sharp so we can stub them
const fsCore = require('fs');
const sharp = require('sharp');

// our local fakes for the “happy‐path”
const mockFakeStream = {
  on: jest.fn().mockReturnThis(),
  pipe: jest.fn((dest) => dest),
};
const mockTransform = {
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  pipe: jest.fn((dest) => dest),
};
// Silence the logger in our tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
// ─────────────────────────────────────────────────────────────────────────────
// Tests for createCloset
// ─────────────────────────────────────────────────────────────────────────────
describe('createCloset controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        title: 'Test Shirt',
        categories: ['Spring'],
        colors: ['Red', 'Blue'],
      },
      file: { path: 'uploads/private/img/closet/test.jpg' },
      user: { _id: 'mockUserId' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it('should create a closet item successfully', async () => {
    const mockCloset = { title: 'Test Shirt' };
    Closet.create.mockResolvedValue(mockCloset);

    await createCloset(req, res, next);

    expect(Closet.create).toHaveBeenCalledWith({
      title: 'Test Shirt',
      categories: ['Spring'],
      user: 'mockUserId',
      photo: 'uploads/private/img/closet/test.jpg',
      colors: ['Red', 'Blue'],
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: mockCloset,
    });
  });

  it('should return error if no image is uploaded', async () => {
    req.file = null;

    await createCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toBe('An image is required.');
  });

  it('should handle invalid categories format', async () => {
    req.body.categories = 123; // invalid

    await createCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toMatch(/Categories must be/);
  });

  it('should handle invalid colors format', async () => {
    req.body.colors = { red: true }; // invalid

    await createCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toMatch(/Colors must be/);
  });

  it('should return error if req.user is missing', async () => {
    req.user = null;

    await createCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for updateCloset
// ─────────────────────────────────────────────────────────────────────────────
describe('updateCloset controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: 'mockClosetId' },
      body: {
        title: 'Updated Shirt',
        categories: ['Summer'],
        colors: ['Green'],
      },
      file: { path: 'uploads/private/img/closet/new.jpg' },
      user: { _id: 'mockUserId' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });
  it('should update closet item successfully', async () => {
    const mockCloset = {
      title: 'Old Shirt',
      categories: ['Winter'],
      colors: ['Red'],
      photo: 'uploads/private/img/closet/old.jpg',
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    Closet.findOne.mockResolvedValue(mockCloset);

    await updateCloset(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();

    const returned = res.json.mock.calls[0][0];
    expect(returned.title).toEqual('Updated Shirt');
    expect(returned.categories).toEqual(['Summer']);
    expect(returned.colors).toEqual(['Green']);
    expect(returned.photo).toEqual(req.file.path);

    expect(mockCloset.save).toHaveBeenCalled();
  });

  it('should return 404 if closet not found', async () => {
    Closet.findOne.mockResolvedValue(null);

    await updateCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toBe('Closet not found');
  });

  it('should return error for invalid categories', async () => {
    req.body.categories = 123;

    await updateCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toMatch(/Categories must be/);
  });

  it('should return error for invalid colors', async () => {
    req.body.colors = { red: true };

    await updateCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toMatch(/Colors must be/);
  });

  it('should return 401 if user is missing', async () => {
    req.user = null;

    await updateCloset(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated.');
  });

  describe('unlink failure cases', () => {
    it('swallows unlink errors in updateCloset', async () => {
      const closet = {
        photo: 'old.jpg',
        save: jest.fn().mockResolvedValue({}),
      };
      Closet.findOne.mockResolvedValue(closet);
      fs.unlink.mockRejectedValue(new Error('no-delete'));

      await updateCloset(req, res, next);

      // Even though unlink failed, we should still 200 & json
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Tests for getClosets
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getClosets controller', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { _id: 'mockUserId' },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    it('should return closets for the user', async () => {
      const mockClosets = [
        { title: 'Shirt', user: 'mockUserId' },
        { title: 'Pants', user: 'mockUserId' },
      ];

      Closet.find.mockResolvedValue(mockClosets);

      await getClosets(req, res, next);

      expect(Closet.find).toHaveBeenCalledWith({ user: 'mockUserId' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClosets);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Tests for getCloset
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getCloset controller', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        params: { id: 'mockClosetId' },
        user: { _id: 'mockUserId' },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });

    it('should return a closet if found', async () => {
      const mockCloset = {
        _id: 'mockClosetId',
        title: 'Test Closet',
        user: 'mockUserId',
      };

      Closet.findOne.mockResolvedValue(mockCloset);

      await getCloset(req, res, next);

      expect(Closet.findOne).toHaveBeenCalledWith({
        _id: 'mockClosetId',
        user: 'mockUserId',
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCloset);
    });

    it('should return 404 if closet is not found', async () => {
      Closet.findOne.mockResolvedValue(null);

      await getCloset(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Closet not found');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Tests for deleteCloset
  // ─────────────────────────────────────────────────────────────────────────────
  describe('deleteCloset controller', () => {
    let req, res, next;

    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        params: { id: 'mockClosetId' },
        user: { _id: 'mockUserId' },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();
    });
    it('should delete closet and its photo successfully', async () => {
      const mockCloset = {
        _id: 'mockClosetId',
        photo: 'uploads/private/img/closet/test.jpg',
      };

      Closet.findOneAndDelete.mockResolvedValue(mockCloset);

      await deleteCloset(req, res, next);

      expect(Closet.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'mockClosetId',
        user: 'mockUserId',
      });

      expect(fs.unlink).toHaveBeenCalledWith(mockCloset.photo);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Closet deleted' });
    });

    it('should return 404 if closet not found', async () => {
      Closet.findOneAndDelete.mockResolvedValue(null);

      await deleteCloset(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Closet not found');
    });

    it('should handle missing photo without error', async () => {
      const mockCloset = { _id: 'mockClosetId', photo: null };

      Closet.findOneAndDelete.mockResolvedValue(mockCloset);

      await deleteCloset(req, res, next);

      expect(fs.unlink).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Closet deleted' });
    });
  });
  it('swallows unlink errors in deleteCloset', async () => {
    Closet.findOneAndDelete.mockResolvedValue({ photo: 'gone.jpg' });
    fs.unlink.mockRejectedValue(new Error('nope-delete'));

    await deleteCloset(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Closet deleted' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests for serveClosetImage
// ─────────────────────────────────────────────────────────────────────────────
describe('serveClosetImage controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    fs.access.mockResolvedValue(undefined);
    // sharp() returns our fake transform
    sharp.mockImplementation(() => mockTransform);

    // createReadStream() returns our fake stream
    fsCore.createReadStream.mockReturnValue(mockFakeStream);

    req = {
      params: { filename: 'test.jpg' },
      user: { _id: 'mockUserId' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
  });
  it('should 400 on invalid filename (path traversal)', async () => {
    req.params.filename = '../hack.jpg';
    await serveClosetImage(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Invalid filename.');
    expect(err.statusCode).toBe(400);
  });

  it('should 400 on invalid filename (absolute path)', async () => {
    req.params.filename = '/etc/passwd';
    await serveClosetImage(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Invalid filename.');
    expect(err.statusCode).toBe(400);
  });

  it('should 400 on invalid filename (path traversal)', async () => {
    req.params.filename = '../hack.jpg';
    await serveClosetImage(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Invalid filename.');
    expect(err.statusCode).toBe(400);
  });

  it('should 404 if filename not found in user’s closets', async () => {
    Closet.find.mockResolvedValue([]);
    req.params.filename = 'notthere.jpg';

    await serveClosetImage(req, res, next);

    expect(Closet.find).toHaveBeenCalledWith({ user: 'mockUserId' });
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0];
    expect(err.message).toMatch(/not associated with any closet item/);
    expect(err.statusCode).toBe(404);
  });

  it('should 404 + send when fs.access() errors out', async () => {
    // one matching record
    Closet.find.mockResolvedValue([
      { photo: 'uploads/private/img/closet/test.jpg' },
    ]);
    // force access to reject
    fs.access.mockRejectedValue(new Error('nope'));

    await serveClosetImage(req, res, next);

    // instead of strict toHaveBeenCalledWith, we normalize slashes
    const calledPath = fs.access.mock.calls[0][0];
    expect(calledPath).toBeDefined();
    expect(calledPath.replace(/\\/g, '/')).toContain(
      'uploads/private/img/closet/test.jpg',
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('File not found');
    expect(next).not.toHaveBeenCalled();
  });

  it('should set headers and pipe through sharp on success', async () => {
    Closet.find.mockResolvedValue([
      { photo: 'uploads/private/img/closet/test.jpg' },
    ]);
    // fs.access resolves by default

    await serveClosetImage(req, res, next);

    // 1) headers
    expect(res.set).toHaveBeenNthCalledWith(1, 'Content-Type', 'image/jpeg');
    expect(res.set).toHaveBeenNthCalledWith(
      2,
      'Cross-Origin-Resource-Policy',
      'cross-origin',
    );
    expect(res.set).toHaveBeenNthCalledWith(
      3,
      'Cache-Control',
      'public, max-age=86400',
    );

    // 2) sharp pipeline
    expect(sharp).toHaveBeenCalled();
    expect(mockTransform.resize).toHaveBeenCalledWith({ width: 800 });
    expect(mockTransform.jpeg).toHaveBeenCalledWith({ quality: 80 });

    // 3) createReadStream + pipe
    const expectedSuffix = path.normalize(
      'uploads/private/img/closet/test.jpg',
    );
    expect(fsCore.createReadStream).toHaveBeenCalledWith(
      expect.stringContaining(expectedSuffix),
    );
    expect(mockFakeStream.pipe).toHaveBeenCalledWith(mockTransform);
    expect(mockTransform.pipe).toHaveBeenCalledWith(res);

    expect(next).not.toHaveBeenCalled();
  });
});

describe('multerFilter helper', () => {
  let cb;
  beforeEach(() => {
    cb = jest.fn();
  });

  it('should accept image mimetypes', () => {
    const fakeReq = {};
    const fakeFile = { mimetype: 'image/png' };

    _multerFilter(fakeReq, fakeFile, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('should reject non-image mimetypes with AppError', () => {
    const fakeReq = {};
    const fakeFile = { mimetype: 'text/plain' };

    _multerFilter(fakeReq, fakeFile, cb);

    // callback called with an error instance
    expect(cb).toHaveBeenCalledTimes(1);
    const [err, allowed] = cb.mock.calls[0];
    expect(allowed).toBe(false);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe(
      'The file introduced is not an image. Please upload an image file.',
    );
    expect(err.statusCode).toBe(400);
  });
});

describe('serveClosetImage stream-error branch', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    fs.access.mockResolvedValue();
    sharp.mockImplementation(() => mockTransform);
    fsCore.createReadStream.mockReturnValue(mockFakeStream);

    req = { params: { filename: 'img.jpg' }, user: { _id: 'u1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 500 if the read stream errors', async () => {
    Closet.find.mockResolvedValue([
      { photo: 'uploads/private/img/closet/img.jpg' },
    ]);
    let errCb;
    mockFakeStream.on.mockImplementationOnce((evt, cb) => {
      if (evt === 'error') errCb = cb;
      return mockFakeStream;
    });

    await serveClosetImage(req, res, next);
    errCb(new Error('stream died'));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error reading file.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Multer
// ─────────────────────────────────────────────────────────────────────────────
describe('multerStorage callbacks', () => {
  it('destination always calls cb(null, <upload-path>)', () => {
    const cb = jest.fn();
    _multerDestination({}, {}, cb);
    expect(cb).toHaveBeenCalledWith(null, 'uploads/private/img/closet');
  });

  it('filename slug-ifies and appends a timestamp', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    const cb = jest.fn();
    const file = { originalname: 'My File Name.JPG' };
    _multerFilename({}, file, cb);
    expect(cb).toHaveBeenCalledWith(null, 'My-File-Name-123456.JPG');
    Date.now.mockRestore();
  });

  it('filter allows images', () => {
    const cb = jest.fn();
    _multerFilter({}, { mimetype: 'image/svg+xml' }, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('filter rejects non-images with a 400 AppError', () => {
    const cb = jest.fn();
    _multerFilter({}, { mimetype: 'application/pdf' }, cb);
    const [err, ok] = cb.mock.calls[0];
    expect(ok).toBe(false);
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
  });
});
// ─────────────────────────────────────────────────────────────────────────────
// NormalizeListInput
// ─────────────────────────────────────────────────────────────────────────────
describe('normalizeListInput helper', () => {
  it('splits comma-separated strings into trimmed arrays', () => {
    expect(normalizeListInput(' one ,two,  three ', 'TestField')).toEqual([
      'one',
      'two',
      'three',
    ]);
  });

  it('wraps a single string in an array', () => {
    expect(normalizeListInput('single', 'TestField')).toEqual(['single']);
  });

  it('passes arrays through untouched', () => {
    const arr = ['a', 'b'];
    expect(normalizeListInput(arr, 'TestField')).toBe(arr);
  });

  it('returns [] when called with undefined/null', () => {
    expect(normalizeListInput(undefined, 'TestField')).toEqual([]);
    expect(normalizeListInput(null, 'TestField')).toEqual([]);
  });

  it('throws when given a non-string, non-array', () => {
    expect(() => normalizeListInput(123, 'Colors')).toThrow(AppError);
    try {
      normalizeListInput(123, 'Colors');
    } catch (err) {
      expect(err.message).toBe('Colors must be an array or a valid string.');
      expect(err.statusCode).toBe(400);
    }
  });
});
