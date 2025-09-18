const fs = require('fs/promises');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const Closet = require('../models/closetModel');
const path = require('path');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};
exports.createUser = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};

exports.updateUser = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};
exports.deleteUser = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'This route is not implemented',
  });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  // 1. Find all closet items by this user
  const userClosets = await Closet.find({ user: req.user._id });

  // 2. Delete all image files in parallel, swallowing any errors
  await Promise.all(
    userClosets.map(async (item) => {
      if (item.photo) {
        try {
          await fs.unlink(path.join(__dirname, '..', item.photo));
        } catch (err) {
          console.error(
            `Failed to delete image file ${item.photo}:`,
            err.message,
          );
          // error swallowed, we continue deleting other files
        }
      }
    }),
  );

  // 3. Delete the closet items from DB
  await Closet.deleteMany({ user: req.user._id });

  // 4. Delete the user
  await User.findByIdAndDelete(req.user._id);

  // 5. Clear refresh token
  res.clearCookie('refreshJwt');

  // 6. Send back 204
  res.status(204).end();
});
