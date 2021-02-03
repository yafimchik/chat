const WsMessage = require('./ws-message');
const serviceFabric = require('../../../resources/service.fabric');
const BadRequestError = require('../../../errors/bad-request.error');
const FullMessage = require('./full-message');
const { ACTIONS, BROADCAST_ANSWERS } = require('../chat-engine.client.constants');

class AnswerGeneratorClient {
  constructor(answerGeneratorServer) {
    this.server = answerGeneratorServer;
    this.updateStatus = this.server.updateStatus.bind(this.server);
    this.fullMessageTemp = null;
  }

  get virtualServerId() {
    return this.server.virtualServerId;
  }

  get serverStatus() {
    return this.server.serverStatus;
  }

  static isBroadcast(answer) {
    return BROADCAST_ANSWERS.includes(answer.payload.action);
  }

  async fromMessage(messageObject) {
    let answer;

    switch (messageObject.payload.action) {
      case ACTIONS.text:
        answer = await this.fromTextMessage(messageObject); break;
      case ACTIONS.messageHeader:
        answer = await this.fromMessageHeader(messageObject); break;
      case ACTIONS.messageFooter:
        answer = await this.fromMessageFooter(messageObject); break;
      case ACTIONS.audioInfo:
        answer = await this.fromAudioInfo(messageObject); break;
      case ACTIONS.fileInfo:
        answer = await this.fromFileInfo(messageObject); break;
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

  fromMessageHeader(messageObject) {
    this.fullMessageTemp = new FullMessage(messageObject.payload);
    console.log('header ', this.fullMessageTemp);

    return WsMessage.clone(messageObject);
  }

  fromAudioInfo(messageObject) {
    if (!this.fullMessageTemp || !messageObject.payload.binaryInfo) throw new BadRequestError();
    this.fullMessageTemp.setAudioInfo({ ...(messageObject.payload.binaryInfo) });
    return WsMessage.clone(messageObject);
  }

  fromFileInfo(messageObject) {
    if (!this.fullMessageTemp || !messageObject.payload.binaryInfo) throw new BadRequestError();
    this.fullMessageTemp.setFileInfo({ ...(messageObject.payload.binaryInfo) });
    return WsMessage.clone(messageObject);
  }

  fromBinary(data) {
    if (!this.fullMessageTemp) throw new BadRequestError();
    this.fullMessageTemp.setBinary(data);
    return new WsMessage({}, undefined, true);
  }

  async fromMessageFooter(messageObject) {
    if (!this.fullMessageTemp) throw new BadRequestError();
    const answer = WsMessage.clone(messageObject);

    answer.payload = await this.fullMessageTemp.save();
    console.log('footer save ', answer.payload);
    this.fullMessageTemp = null;

    return answer;
  }

  async fromTextMessage(messageObject) {
    const answer = WsMessage.clone(messageObject);

    const textMessage = new FullMessage(messageObject.payload);
    console.log('text', textMessage);
    answer.payload = await textMessage.save();

    return answer;
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

    const history = await serviceFabric.create('message')
      .getHistory(answer.payload.chat, answer.payload.offset);

    for (let message of history) {
      console.log('is attached ', message);
      if (message.attached) {
        console.log('on attached ');
        message.audio = await serviceFabric.create('audio').getByMessageId(message._id);
        message.files = await serviceFabric.create('file').getByMessageId(message._id);
      }
    }

    answer.payload.history = history;
    return answer;
  }
}

module.exports = AnswerGeneratorClient;
