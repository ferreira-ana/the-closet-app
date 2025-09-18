class AppError extends Error {
  constructor(message = 'Something went wrong', statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    // define status through status code
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //this distinguishes which errors get sent to the user. only operational errors are trusted
    this.isOperational = true;
    //this is to not polute the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
