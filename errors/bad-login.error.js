const ServerError = require('./server-error.error');

class BadLoginError extends ServerError {
  constructor(message = 'Incorrect login or password', status = 403) {
    super(message, status);
  }
}

module.exports = BadLoginError;
