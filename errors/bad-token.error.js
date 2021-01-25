const ServerError = require('./server-error.error');

class BadTokenError extends ServerError {
  constructor(message = 'Incorrect token', status = 403) {
    super(message, status);
  }
}

module.exports = BadTokenError;
