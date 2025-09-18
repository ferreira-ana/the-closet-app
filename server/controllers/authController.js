const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = generateAccessToken(user._id); // Access Token
  const refreshTkn = generateRefreshToken(user._id); // Refresh Token

  const cookieExpireDays =
    parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN, 10) || 7;

  const refreshTokenCookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    refreshTokenCookieOptions.secure = true;
    refreshTokenCookieOptions.sameSite = 'Strict'; // Prevent CSRF
  }
  res.cookie('refreshJwt', refreshTkn, refreshTokenCookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token, // Access token
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: (req.body.email || '').trim().toLowerCase(),
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    // Duplicate email (Mongo/Mongoose)
    if (err && (err.code === 11000 || err.keyPattern?.email)) {
      return next(new AppError('E11000 duplicate key', 409)); // 409 Conflict
    }

    // Mongoose validation error (min length, confirm mismatch, etc.)
    if (err && err.name === 'ValidationError') {
      return next(new AppError(err.message, 400)); // 400 Bad Request
    }

    // Anything else: we let catchAsync/global handler deal with it as 500
    return next(err);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email and a password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  const cookieOptions = { httpOnly: true };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'Strict';
  }

  // here we could have either used clearCookie or overwrite with an immediate expiration
  // res.cookie('refreshJwt', '', { ...cookieOptions, expires: new Date(0) });
  res.clearCookie('refreshJwt', cookieOptions);

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  let decoded;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired. Please refresh.', 401));
    }
    return next(new AppError('Invalid token.', 401));
  }

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  req.user = currentUser;
  next();
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshJwt;

    // No cookie at all? "no content" so the client won't log a 401.
    if (!refreshToken) {
      return res.status(204).end(); //there's no error, nothing to refresh
    }

    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found.', 401));
    }

    createSendToken(user, 200, res);
  } catch (err) {
    // 401 to signal truly bad token.
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return next(new AppError('Refresh token invalid or expired.', 401));
    }
    next(err);
  }
});
