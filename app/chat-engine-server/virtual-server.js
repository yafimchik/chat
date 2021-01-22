const VirtualServerClient = require("./virtual-server.client");
const {PING_TIMEOUT} = require("./chat-engine.constants");
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const serviceFabric = require("../../resources/service.fabric");

class VirtualServer {
  constructor(virtualServerId = uuidv4()) {
    this.wss = new WebSocket.Server({ noServer: true });
    this.wss.on('connection', this.onConnection.bind(this));

    this.wss.on('close', function close() {
      // if (this.startPingClientsInterval) {
      //   clearInterval(this.startPingClientsInterval);
      // }
    });

    this.id = virtualServerId;

    this.pingTimeout = PING_TIMEOUT;
    this.clients = [];
    this.startPingClientsInterval = undefined;
    this.status = [];
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
    console.log('try to send all clients', messageObject);
    const text = JSON.stringify(messageObject);
    this.clients.forEach(client => {
      console.log('sending to client ', client.user);
      if (client.user) {
        console.log('auth user ', client);
        client.connection.send(text);
      } else {
        console.log('no auth of user', client);
      }
    });
  }

  async broadcastContactsOnline() {
    const messageObject = { payload: {}, uuid: uuidv4() };
    messageObject.payload.contactsOnline = (await serviceFabric.create('user')
      .getMany(this.contactsOnline)).map(user => ({
        ...user,
        _id: user._id.toString(),
        virtualServers: user.virtualServers.map((vs) => vs.toString()),
      }));
    messageObject.payload.contactsOnline.forEach(contact => {
      delete contact.password;
    });

    this.broadcastMessage(messageObject);
    this.updateStatus();
  }

  broadcastStatus() {
    const messageObject = { payload: {}, uuid: uuidv4() };
    messageObject.payload.status = this.status.map(status => ({
      user: status.user.toString(),
      value: status.value.toString(),
    }));

    this.broadcastMessage(messageObject);
  }

  handleServerUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, client => {
      this.wss.emit('connection', client, request);
    });
  }

  updateStatus(user, value) {
    console.log('cur status ', this.status);
    this.status = this.status.filter(item => item.user !== user);
    if (value !== undefined) {
      this.status.push({ user, value });
    }
    console.log('after add ', this.status);
    const contacts = this.contactsOnline;
    this.status = this.status
      .filter(item => contacts.some((contact) => contact.toString() === item.user));
    console.log('after filter ', this.status);
    this.broadcastStatus();
  }

  get contactsOnline() {
    return this.clients
      .map(client => client.user ? client.user : undefined)
      .filter(contact => !!contact);
  }

  get contacts() { // TODO get Contacts
    return this.clients
      .map(client => client.user ? client.user : undefined)
      .filter(contact => !!contact);
  }
}

module.exports = VirtualServer;
