const ServerError = require('./server-error.error');

class NotFoundError extends ServerError {
  constructor(message = '', status = 404) {
    super(`${message} NOT FOUND`, status);
  }
}

module.exports = NotFoundError;
