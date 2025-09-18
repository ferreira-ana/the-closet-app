const AppError = require('./../utils/appError');

//we went to the db to get the error message that showed, that's the cast error and the path is the id
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  //400 stands for bad request. this is a case where the id inserted is wrong
  return new AppError(message, 400);
};

/***
 * function that handles duplicated field name! we want to get the duplicated name that the user inputed and that name comes up in the database in a "name" format so we use a regular expression to extract it.
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //Programming or other unknown error
    //Log error
    console.error('ERROR ', err);
    //send a generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  //by specifying 4 parameters express knows it is a error handling middleware
  //if the error does not come defined then it is equal to 500
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //creating a copy of the err object to work with it
    let error = Object.assign({}, err);
    error.name = err.name;
    error.message = err.message;
    error.stack = err.stack;
    error.path = err.path;
    error.value = err.value;
    error.code = err.code;
    error.errmsg = err.errmsg;
    error.errors = err.errors;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
