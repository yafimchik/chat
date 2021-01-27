export default class ConnectionError extends Error {
  constructor(message = 'Connection Error', responseStatus = 500) {
    super(message);
    this.shortMsg = message;
    this.responseStatus = responseStatus;
  }
}
