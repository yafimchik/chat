const BadTokenError = require('../../../errors/bad-token.error');
const BadPermissionError = require('../../../errors/bad-permission.error');
const AnswerGeneratorClient = require('./answer.generator.client');
const serviceFabric = require('../../../resources/service.fabric');
const loginService = require('../../../common/login.service');
const WsMessage = require('./ws-message');

class VirtualServerClient {
  constructor(wsConnection, virtualServer) {
    this.connection = wsConnection;
    this.user = undefined;
    this.virtualServer = virtualServer;
    this.answerGenerator = this.virtualServer.answerGenerator.createClient();
    this.isAlive = true;
    this.initConnection();
  }

  initConnection() {
    this.connection.on('message', this.onMessage.bind(this));
    this.connection.on('error', this.onError.bind(this));
    this.connection.on('close', this.onClose.bind(this));
    this.connection.on('pong', this.onPong.bind(this));
  }

  onPong() {
    this.isAlive = !!this.user;
  }

  onBinaryMessage(data) {
    try {
      this.sendToClient(this.answerGenerator.fromBinary(data));
    } catch (error) {
      this.sendErrorToClient(new WsMessage({}, undefined, true), error);
    }
  }

  async onMessage(message) {
    if (typeof message !== 'string') {
      this.onBinaryMessage(message);
      return;
    }
    console.log('not binary');

    const messageObject = WsMessage.fromString(message);
    const token = messageObject.payload.token;
    delete messageObject.payload.token;

    try {
      if (!await loginService.checkToken(token)) {
        throw new BadTokenError();
      }

      messageObject.payload.user = loginService.getUserId(token);

      const userHasPermission = await serviceFabric.create('user')
        .hasVirtualServer(messageObject.payload.user, this.virtualServer.id);
      if (!userHasPermission) throw new BadPermissionError();

      if (!this.user) {
        this.user = messageObject.payload.user;
        await this.virtualServer.broadcastContactsOnline();
      }

      const answer = await this.answerGenerator.fromMessage(messageObject);

      if (AnswerGeneratorClient.isBroadcast(answer)) {
        this.virtualServer.broadcastMessage(answer);
      } else {
        this.sendToClient(answer);
      }
    } catch (error) {
      this.sendErrorToClient(messageObject, error);
    }
  }

  sendToClient(messageObject) {
    this.connection.send(messageObject.toString());
  }

  onError(error) {
    console.log('ws error ', error);
    this.connection.terminate();
  }

  sendErrorToClient(messageObject, error) {
    console.log(error);
    messageObject.payload.error = {
      shortMsg: error.shortMsg,
      responseStatus: error.responseStatus,
    };
    this.sendToClient(messageObject);
  }

  async onClose(event) {
    console.log(event);
    this.virtualServer.clients = this.virtualServer.clients.filter(client => client !== this);
    await this.virtualServer.broadcastContactsOnline();
  }
}

module.exports = VirtualServerClient;
