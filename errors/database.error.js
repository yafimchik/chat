const ServerError = require('./server-error.error');

class DatabaseError extends ServerError {
  constructor(message = 'Database Error', status = 500) {
    super(message, status);
  }
}

module.exports = DatabaseError;
