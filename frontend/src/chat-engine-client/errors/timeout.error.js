import ConnectionError from './connection.error';

export default class TimeoutError extends ConnectionError {
  constructor(
    message = 'Request timeout Error. Server is not responding!',
    status = 401,
  ) {
    super(message, status);
  }
}
