import WsMessage from "../../frontend/chat-engine-client/async-socket/ws-message";
import BadTokenError from "../../errors/bad-token.error";
import BadPermissionError from "../../errors/bad-permission.error";
import AnswerGenerator from "./answer.generator";

const serviceFabric = require("../../resources/service.fabric");
const loginService = require("../../common/login.service");

class VirtualServerClient {
  constructor(wsConnection, virtualServer) {
    this.connection = wsConnection;
    this.user = undefined;
    this.virtualServer = virtualServer;
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

  async onMessage(message) {
    if (typeof message !== 'string') return; // TODO  AFTER processing of arrayBuffer

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

      const answer = await this.virtualServer.answerGenerator.fromMessage(messageObject);

      if (AnswerGenerator.isBroadcast(answer)) {
        this.virtualServer.broadcastMessage(answer);
      } else {
        this.virtualServer.sendToClient(answer);
      }
    } catch (error) {
      this.sendErrorToClient(messageObject, error);
    }
  }

  sendToClient(messageObject) {
    this.connection.send(messageObject.toString());
  }

  onError(error) {
    console.log(error);
    this.connection.terminate();
  }

  sendErrorToClient(messageObject, error) {
    messageObject.error = error;
    this.sendToClient(messageObject);
  }

  async onClose(event) {
    console.log(event);
    this.virtualServer.clients = this.virtualServer.clients.filter(client => client !== this);
    await this.virtualServer.broadcastContactsOnline();
  }
}

module.exports = VirtualServerClient;
