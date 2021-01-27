export default class ServerError extends Error {
  constructor(message = 'Internal client Error', responseStatus = 500) {
    super(message);
    this.shortMsg = message;
    this.responseStatus = responseStatus;
  }
}
