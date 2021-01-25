const ServerError = require('./server-error.error');

class BadPermissionError extends ServerError {
  constructor(message = 'User does not have access to this virtual server!', status = 403) {
    super(message, status);
  }
}

module.exports = BadPermissionError;
