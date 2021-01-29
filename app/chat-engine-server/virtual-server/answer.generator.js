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
    return BROADCAST_ANSWERS.includes(answer.payload.action);
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
    return answer;
  }

  async fromTextMessage(messageObject) {
    const textMessage = { ...(messageObject.payload) };
    textMessage.date = new Date();
    const answer = WsMessage.clone(messageObject);

    let { audios } = textMessage;
    let { files } = textMessage;
    if (textMessage.audios) delete textMessage.audios;
    if (textMessage.files) delete textMessage.files;

    const messageSavedInDB = await serviceFabric.create('message').create(textMessage);

    if (messageSavedInDB) {
      if (audios) {
        // TODO saving audios
        audios = audios.forEach((record) => record.message = messageSavedInDB._id);
        const audiosSavedInDB = await serviceFabric.create('audio').createMany(audios);
        audios = undefined;
        if (audiosSavedInDB) audios = audiosSavedInDB.map((audioRecord) => ({
          _id: audioRecord._id,
          message: audioRecord.message,
          size: audioRecord.audio.size,
          type: audioRecord.type,
        }));
        textMessage.audios = audios;
      }
      if (files) {
        // TODO saving files
        files = files.forEach((record) => record.message = messageSavedInDB._id);
        const filesSavedInDB = await serviceFabric.create('file').createMany(files);
        files = undefined;
        if (filesSavedInDB) files = filesSavedInDB.map((fileRecord) => ({
          _id: fileRecord._id,
          message: fileRecord.message,
          size: fileRecord.file.size,
          filename: fileRecord.filename,
        }));
        textMessage.files = files;
      }
      answer.payload = textMessage;
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
