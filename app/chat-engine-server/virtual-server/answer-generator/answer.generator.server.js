const WsMessage = require('../ws-message');
const AnswerGeneratorClient = require('./answer.generator.client');
const { filterDoublesInArray } = require('../../../../common/utils');
const { ACTIONS, BROADCAST_ANSWERS } = require('../../chat-engine.client.constants');

class AnswerGeneratorServer {
  constructor(virtualServer) {
    this.virtualServer = virtualServer;
  }

  get virtualServerId() {
    return this.virtualServer.id;
  }

  get contactsOnline() {
    return this.virtualServer.contactsOnline;
  }

  get serverStatus() {
    return this.virtualServer.serverStatus;
  }

  createClient() {
    return new AnswerGeneratorClient(this);
  }

  updateStatus(user, status) {
    const userStatus = this.serverStatus.find((userStatus) => userStatus.user === user);
    if (userStatus) {
      userStatus.value.update(status);
    }

    return this.serverStatus;
  }

  fromContactsOnline() {
    const contactsOnline = filterDoublesInArray(this.contactsOnline, (user) => user._id);
    const answer = new WsMessage({
      contactsOnline,
      action: ACTIONS.getContactsOnline,
    });
    return answer;
  }

  fromStatus() {
    const status = filterDoublesInArray(this.serverStatus, (status) => status.user);
    return new WsMessage({
      status,
      action: ACTIONS.status,
    });
  }

  static isBroadcast(answer) {
    return BROADCAST_ANSWERS.includes(answer.payload.action);
  }
}

module.exports = AnswerGeneratorServer;
