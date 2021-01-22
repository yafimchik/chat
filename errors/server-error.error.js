class ServerError extends Error {
  constructor(message = 'Internal Server Error', responseStatus = 500) {
    super(message);
    this.shortMsg = message;
    this.responseStatus = responseStatus;
  }
}

module.exports = ServerError;
