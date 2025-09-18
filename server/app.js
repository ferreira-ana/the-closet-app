const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const closetRouter = require('./routes/closetRoutes');

const app = express();

//  1)  security HTTP headers
app.use(helmet());

// 2) CORS Configuration: Allow requests from the frontend
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN, // reads from .env allows to choose a different origin according to environment
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true, // allow cookies / auth headers
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// 3) Allow cross-origin access to images
app.use(
  '/static',
  express.static(path.join(__dirname, 'uploads/public'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);

// 4) Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  5) Rate limiting (security)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//  6) Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//  7) Data sanitization (security)
app.use(mongoSanitize());
app.use(xss());

//  8) Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration'], // Allow duplicate query parameters for these fields
  }),
);

//  9) Test middleware (timestamp)
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//  10) Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/closets', closetRouter);

//  11) Catch-all for unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//  12) Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
