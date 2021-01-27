import ServerError from './server.error';

export default class BadResponseError extends ServerError {
  constructor(
    message = 'Error on server!',
    status = 401,
  ) {
    super(message, status);
  }
}
