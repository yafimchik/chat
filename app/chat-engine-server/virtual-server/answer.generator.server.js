const WsMessage = require('./ws-message');
const AnswerGeneratorClient = require('./answer.generator.client');
const { ACTIONS, BROADCAST_ANSWERS } = require("../chat-engine.client.constants");

class AnswerGeneratorServer {
  constructor(virtualServerId) {
    this.virtualServerId = virtualServerId;
    this.contactsOnline = [];
    this.serverStatus = [];
  }

  createClient() {
    return new AnswerGeneratorClient(this);
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
}

module.exports = AnswerGeneratorServer;
