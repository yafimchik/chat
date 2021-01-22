const serviceFabric = require("../../resources/service.fabric");
const loginService = require("../../common/login.service");
const ERRORS = require("./errors");
const ACTIONS = require("./chat-engine.client.constants");

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
    console.log('PONG');
    this.isAlive = !!this.user;
  }

  async onMessage(message) { // TODO check user has this vs
    if (typeof message !== 'string') return; // TODO  AFTER processing of arrayBuffer
    const messageObj = JSON.parse(message);

    if (!await loginService.checkToken(messageObj.payload.token)) {
      this.sendToClient({ ...messageObj, payload: { error: ERRORS.badToken } });
      return;
    }
    messageObj.payload.user = loginService.getUserId(messageObj.payload.token);
    delete messageObj.token;
    messageObj.payload.date = new Date();

    if (messageObj.payload.action === ACTIONS.text) await this.onTextMessage(messageObj);
    if (messageObj.payload.action !== ACTIONS.text) await this.onServiceMessage(messageObj);
  }

  sendToClient(messageObject) {
    const messageToSend = {...messageObject};
    if (messageToSend.token) delete messageToSend.token;
    this.connection.send(JSON.stringify(messageToSend));
  }

  async onServiceMessage(messageObject) {
    let answer = {...messageObject};

    if (messageObject.payload.action === ACTIONS.status) {
      this.virtualServer.updateStatus(messageObject.payload.user, messageObject.payload.status);
      return;
    }

    if (messageObject.payload.action === ACTIONS.getContacts) {
      let contacts = await serviceFabric.create('user').getAll([]);
      if (contacts) {
        // contacts = contacts
        //   .filter(user => user.virtualServers.find((vs) => vs._id === this.virtualServer.id));
        contacts = contacts.map(user => ({
          ...user,
          _id: user._id.toString(),
          virtualServers: user.virtualServers.map(vs => vs.toString()),
        }));
      }
      answer.payload.contacts = [...contacts];
    }

    if (messageObject.payload.action === ACTIONS.getChats) {
      answer.payload.chats = await serviceFabric.create('chat')
        .getWhere({ virtualServer: this.virtualServer.id }, []);
      answer.payload.chats = answer.payload.chats.map(chat => ({
        ...chat,
        _id: chat._id.toString(),
        virtualServer: chat.virtualServer._id.toString(),
      }));
    }

    if (messageObject.payload.action === ACTIONS.getHistory) {
      answer.payload.history = await serviceFabric.create('message')
        .getWhere({ chat: answer.payload.chat }, []);
      answer.payload.history = answer.payload.history.map(message => ({
        ...message,
        _id: message._id.toString(),
        chat: message.chat.toString(),
        user: message.user.toString(),
      }));
    }

    if (messageObject.payload.action === ACTIONS.userInfo) {
      this.user = messageObject.payload.user;
      await this.virtualServer.broadcastContactsOnline();
    }

    if (messageObject.payload.action === ACTIONS.getContactsOnline) {
      answer.payload.contactsOnline = this.virtualServer.contactsOnline;
      answer.payload.contactsOnline = answer.payload.contactsOnline.map(user => ({
        ...user,
        _id: user._id.toString(),
        virtualServers: user.virtualServers.map(vs => vs.toString()),
      }));
    }

    this.sendToClient(answer);
  }

  async onTextMessage(messageObj) {
    console.log('text', messageObj);
    const messageService = serviceFabric.create('message');

    const textMessage = { ...(messageObj.payload) };

    if (await messageService.create(textMessage)) {
      console.log('save to db', messageObj);
      const answer = { ...messageObj };
      answer.payload.user = answer.payload.user.toString();
      this.virtualServer.broadcastMessage(answer);
    } else {
      console.log('can not save to db', messageObj);
      const answer = {
        ...messageObj,
      };
      answer.payload.error = ERRORS.dbError,
      this.sendToClient({...messageObj});
    }
  }

  onError(error) {
    console.log(error);
    this.connection.terminate();
    // this.virtualServer.clients = this.virtualServer.clients.filter(client => client !== this);
    // console.log('Client said: ' + error.toString());
    // this.virtualServer.broadcastContacts();
  }

  async onClose(event) {
    console.log(event);
    this.virtualServer.clients = this.virtualServer.clients.filter(client => client !== this);
    await this.virtualServer.broadcastContactsOnline();
  }
}

module.exports = VirtualServerClient;
