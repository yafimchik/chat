const ServerError = require('./server-error.error');

class NotFoundError extends ServerError {
  constructor(message = 'NOT FOUND', status = 404) {
    super(message, status);
  }
}

module.exports = NotFoundError;
