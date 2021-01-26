const WsMessage = require('./ws-message');
const DatabaseError = require("../../../errors/database.error");
const serviceFabric = require("../../../resources/service.fabric");
const { ACTIONS, BROADCAST_ANSWERS } = require("../chat-engine.client.constants");

class AnswerGenerator {
  constructor(virtualServerId) {
    this.virtualServerId = virtualServerId;
    this.contactsOnline = [];
    this.serverStatus = [];
  }

  updateStatus(user, value) {
    if (user) {
      this.serverStatus = this.serverStatus.filter((userStatus) => userStatus.user !== user);
      if (value !== undefined) {
        this.serverStatus.push({ user, value });
      }
    }

    this.serverStatus = this.serverStatus
      .filter(userStatus => this.contactsOnline.some((user) => user === userStatus.user));

    return this.serverStatus;
  }

  fromContactsOnline(contactsOnline) {
    this.contactsOnline = [ ...contactsOnline ];
    const answer = new WsMessage({
      contactsOnline: this.contactsOnline,
      action: ACTIONS.getContactsOnline,
    });

    this.updateStatus();

    return answer;
  }

  fromStatus() {
    return new WsMessage({
      status: this.serverStatus,
      action: ACTIONS.status,
    });
  }

  static isBroadcast(answer) {
    return BROADCAST_ANSWERS.includes(answer);
  }

  async fromMessage(messageObject) {
    let answer;

    switch (messageObject.payload.action) {
      case ACTIONS.text:
        answer = await this.fromTextMessage(messageObject); break;
      case ACTIONS.status:
        answer = await this.fromStatusMessage(messageObject); break;
      case ACTIONS.getContacts:
        answer = await this.fromGetContactsMessage(messageObject); break;
      case ACTIONS.getChats:
        answer = await this.fromGetChatsMessage(messageObject); break;
      case ACTIONS.getHistory:
        answer = await this.fromGetHistoryMessage(messageObject); break;
      default:
        answer = WsMessage.clone(messageObject);
    }
    console.log(answer);

    return answer;
  }

  async fromTextMessage(messageObject) {
    const textMessage = { ...(messageObject.payload) };
    const date = new Date();
    textMessage.date = date;
    const answer = {
      ...messageObject,
      date,
    };

    const messageIsSavedInDB = await serviceFabric.create('message').create(textMessage);

    if (messageIsSavedInDB) {
      return answer;
    } else {
      throw new DatabaseError('Message was not saved');
    }
  }

  async fromStatusMessage(messageObject) {
    this.updateStatus(messageObject.payload.user, messageObject.payload.status);

    return new WsMessage({
      status: this.serverStatus,
      action: ACTIONS.status,
    });
  }

  async fromGetContactsMessage(messageObject) {
    const answer = WsMessage.clone(messageObject);
    answer.payload.contacts = await serviceFabric.create('user').getContacts();

    return answer;
  }

  async fromGetChatsMessage(messageObject) {
    const answer = WsMessage.clone(messageObject);
    answer.payload.chats = await serviceFabric.create('chat')
      .getChatsOfVirtualServer(this.virtualServerId);

    return answer;
  }

  async fromGetHistoryMessage(messageObject) {
    const answer = WsMessage.clone(messageObject);

    answer.payload.history = await serviceFabric.create('message')
      .getHistory(answer.payload.chat, answer.payload.offset);

    return answer;
  }
}

module.exports = AnswerGenerator;