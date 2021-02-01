import ServerError from './server.error';

export default class SendMessageError extends ServerError {
  constructor(
    message = 'Error on server! Message was not sent',
    status = 401,
  ) {
    super(message, status);
  }
}
