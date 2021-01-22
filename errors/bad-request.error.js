const ServerError = require('./server-error.error');

class BadRequestError extends ServerError {
  constructor(message = 'BAD REQUEST', status = 400) {
    super(message, status);
  }
}

module.exports = BadRequestError;
