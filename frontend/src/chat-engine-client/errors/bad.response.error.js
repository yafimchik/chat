import ClientError from './client.error';

export default class BadResponseError extends ClientError {
  constructor(
    message = 'Error on server!',
    status = 401
  ) {
    super(message, status);
  }
}
