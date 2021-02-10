const VirtualServerClient = require("./virtual-server.client");
const { PING_TIMEOUT } = require("../chat-engine.constants");
const { v4: uuidV4 } = require('uuid');
const WebSocket = require('ws');
const serviceFabric = require('../../../resources/service.fabric');
const AnswerGeneratorServer = require('./answer-generator/answer.generator.server');

class VirtualServer {
  constructor(virtualServerId = uuidV4()) {
    this.wss = new WebSocket.Server({ noServer: true });
    this.wss.on('connection', this.onConnection.bind(this));

    this.id = virtualServerId;

    this.pingTimeout = PING_TIMEOUT;
    this.clients = [];
    this.startPingClientsInterval = undefined;
    this.answerGenerator = new AnswerGeneratorServer(this);
  }

  ping() {
    this.clients.forEach((client) => {
      if (client.isAlive === false) return client.connection.terminate();
      client.isAlive = false;
      client.connection.ping(() => {});
    });
  }

  startPingClients(timeout) {
    if (this.startPingClientsInterval) return;
    this.startPingClientsInterval = setInterval(this.ping.bind(this), timeout);
  }

  async onConnection(socket, request, client) {
    this.clients.push(new VirtualServerClient(
      socket,
      this
    ));
    this.startPingClients(this.pingTimeout);
    await this.broadcastContactsOnline();
  }

  broadcastMessage(messageObject) {
    this.clients.forEach(client => {
      if (client.user) client.sendToClient(messageObject);
    });
  }

  async broadcastContactsOnline() {
    const contactsOnline = await serviceFabric.create('user')
      .getContactsInfo(this.contactsOnline);

    const message = this.answerGenerator.fromContactsOnline(contactsOnline);

    this.broadcastMessage(message);
    this.broadcastStatus();
  }

  broadcastStatus() {
    const message = this.answerGenerator.fromStatus();
    this.broadcastMessage(message);
  }

  handleServerUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, client => {
      this.wss.emit('connection', client, request);
    });
  }

  get contactsOnline() {
    return this.clients
      .filter((client) => client.user)
      .map((client) => client.user);
  }

  get serverStatus() {
    return this.clients
      .filter((client) => client.user)
      .map((client) => ({
        user: client.user._id,
        value: client.status,
      }));
  }
}

module.exports = VirtualServer;
