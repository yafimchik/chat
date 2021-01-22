const ServerError = require('./server-error.error');

class UnauthorizedError extends ServerError {
  constructor(message = 'UNAUTHORIZED ACCESS DENIED', status = 401) {
    super(message, status);
  }
}

module.exports = UnauthorizedError;
