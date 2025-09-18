const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs/promises');
const Closet = require('../models/closetModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { createReadStream } = require('fs');

//_multerDestination and _multerFilename are exposed for testing.
const _multerDestination = (req, file, cb) => {
  cb(null, 'uploads/private/img/closet');
};

const _multerFilename = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
  cb(null, `${name}-${Date.now()}${ext}`);
};

const multerStorage = multer.diskStorage({
  destination: _multerDestination,
  filename: _multerFilename,
});

//Check whether the file is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'The file introduced is not an image. Please upload an image file.',
        400,
      ),
      false,
    );
  }
};

function normalizeListInput(input, fieldName) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    return input.split(',').map((s) => s.trim());
  }
  throw new AppError(`${fieldName} must be an array or a valid string.`, 400);
}

// Create Multer upload instance with storage config
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserCloset = upload.single('photo');

exports.serveClosetImage = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;

  if (filename.includes('..') || path.isAbsolute(filename)) {
    return next(new AppError('Invalid filename.', 400));
  }

  const closets = await Closet.find({ user: req.user._id });

  const closet = closets.find((item) => {
    const storedFilename = path.basename(item.photo);
    return storedFilename === filename;
  });

  if (!closet) {
    return next(
      new AppError(
        'Image not found or not associated with any closet item.',
        404,
      ),
    );
  }

  const filePath = path.join(__dirname, '..', closet.photo);

  try {
    await fs.access(filePath);

    res.set('Content-Type', 'image/jpeg');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'public, max-age=86400');

    const transform = sharp().resize({ width: 800 }).jpeg({ quality: 80 });

    createReadStream(filePath)
      .on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).send('Error reading file.');
      })
      .pipe(transform)
      .pipe(res);
  } catch (err) {
    console.error('File access error:', err);
    return res.status(404).send('File not found');
  }
});

exports.createCloset = catchAsync(async (req, res, next) => {
  const { title, categories, colors } = req.body;
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated.', 401));
  }

  const normalizedCategories = normalizeListInput(categories, 'Categories');

  const normalizedColors = normalizeListInput(colors, 'Colors');

  if (!req.file) {
    return next(new AppError('An image is required.', 400));
  }

  const closet = await Closet.create({
    title,
    categories: normalizedCategories || [],
    user: req.user._id,
    photo: req.file.path,
    colors: normalizedColors || [],
  });

  res.status(201).json({
    status: 'success',
    data: closet,
  });
});

exports.getClosets = catchAsync(async (req, res, next) => {
  const closets = await Closet.find({ user: req.user._id });
  res.status(200).json(closets);
});

exports.updateCloset = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, categories, colors } = req.body;

  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated.', 401));
  }

  const normalizedCategories = normalizeListInput(categories, 'Categories');

  const normalizedColors = normalizeListInput(colors, 'Colors');
  //Find the existing closet to get the current image path
  const closet = await Closet.findOne({ _id: id, user: req.user._id });

  if (!closet) {
    return next(new AppError('Closet not found', 404));
  }

  //If a new file was uploaded, delete the old image
  if (req.file) {
    try {
      if (closet.photo) {
        await fs.unlink(closet.photo);
        console.log('Old image deleted:', closet.photo);
      }
      closet.photo = req.file.path; //update field to new image path
    } catch (err) {
      console.error('Error deleting old image:', err);
    }
  }

  //Update other fields
  closet.title = title;
  closet.categories = normalizedCategories;
  closet.colors = normalizedColors;

  await closet.save();
  res.status(200).json(closet);
});

exports.deleteCloset = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const closet = await Closet.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!closet) {
    return next(new AppError('Closet not found', 404));
  }

  if (closet.photo) {
    try {
      await fs.unlink(closet.photo);
    } catch (err) {
      console.error('Failed to delete image file:', err);
    }
  }

  res.status(200).json({ message: 'Closet deleted' });
});

exports.getCloset = catchAsync(async (req, res, next) => {
  const { id } = req.params; //closet id from the URL
  // Ensure the closet belongs to the user that is currently logged in
  const closet = await Closet.findOne({ _id: id, user: req.user._id });

  if (!closet) {
    return next(new AppError('Closet not found', 404));
  }

  res.status(200).json(closet);
});
exports._multerFilter = multerFilter;
exports._multerDestination = _multerDestination;
exports._multerFilename = _multerFilename;
exports.normalizeListInput = normalizeListInput;
