const VirtualServerClient = require('./virtual-server.client');
const { PING_TIMEOUT } = require('../chat-engine.constants');
const { v4: uuidV4 } = require('uuid');
const WebSocket = require('ws');
const serviceFabric = require('../../../resources/service.fabric');
const AnswerGeneratorServer = require('./answer-generator/answer.generator.server');
const VoiceChannelServer = require('./voice-channel-server/voice-channel.server');

class VirtualServer {
  constructor(virtualServerId = uuidV4()) {
    this.wss = new WebSocket.Server({ noServer: true });
    this.wss.on('connection', this.onConnection.bind(this));

    this.voiceChannels = [];

    this.id = virtualServerId;

    this.pingTimeout = PING_TIMEOUT;
    this.clients = [];
    this.startPingClientsInterval = undefined;
    this.answerGenerator = new AnswerGeneratorServer(this);
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

  async getVoiceChannelById(voiceChannelId) {
    let voiceChannel = this.voiceChannels.find((vcs) => vcs.id === voiceChannelId);
    if (!voiceChannel) {
      const voiceChannelInfo = await serviceFabric.create('voiceChannel')
        .getById(voiceChannelId);
      voiceChannel = new VoiceChannelServer(voiceChannelInfo, this);
      this.voiceChannels.push(voiceChannel);
    }
    return voiceChannel;
  }

  async getVoiceChannels() {
    this.voiceChannels = await serviceFabric.create('voiceChannel')
      .getVoiceChannelsOfVirtualServer(this.id);
    this.voiceChannels = this.voiceChannels
      .map((voiceChannel) => new VoiceChannelServer(voiceChannel, this));
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
    if (!this.voiceChannels) {
      await this.getVoiceChannels();
    }
    this.startPingClients(this.pingTimeout);
    await this.broadcastContactsOnline();
  }

  async processMessageByVirtualServer(messageObject) {
    if (VoiceChannelServer.isServiceMessage(messageObject)) {
      await this.getVoiceChannelById(messageObject.payload.voiceChannel)
        .onServiceMessage(messageObject);
      return true;
    }
    return false;
  }

  broadcastMessage(messageObject, clients) {
    let contacts = clients;
    if (!contacts) {
      if (messageObject.payload.to) {
        contacts = messageObject.payload.to;
        contacts = (contacts instanceof Array) ? contacts : [ contacts ];
      }
    }
    this.clients.forEach(client => {
      if (!client.user) return;
      if (!contacts || contacts.includes(client.user._id)) {
        client.sendToClient(messageObject);
      }
    });
  }

  sendToClient(userId, messageObject) {
    const client = this.clients.find((someClient) => someClient.user._id === userId);
    if (client) client.sendToClient(messageObject);
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
}

module.exports = VirtualServer;
