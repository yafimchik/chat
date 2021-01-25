const ServerError = require('./server-error.error');

class BadMongoModelError extends ServerError {
  constructor(message = '', status = 500) {
    super(`wrong config of "${message}" MongoDb model`, status);
  }
}

module.exports = BadMongoModelError;
