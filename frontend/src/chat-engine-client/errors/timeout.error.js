import ClientError from './client.error';

export default class TimeoutError extends ClientError {
  constructor(
    message = 'Request timeout Error. Server is not responding!',
    status = 401
  ) {
    super(message, status);
  }
}
