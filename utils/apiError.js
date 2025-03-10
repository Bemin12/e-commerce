// @desc    this class is responsible for operational errors (errors that we can predict)
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, APIError);
  }
}

module.exports = APIError;
