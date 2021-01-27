export default class ClientError extends Error {
  constructor(message = 'Client Error', responseStatus = 500) {
    super(message);
    this.shortMsg = message;
    this.responseStatus = responseStatus;
  }
}
