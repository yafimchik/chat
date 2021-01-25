const { v4: uuidV4 } = require('uuid');

class WsMessage {
  constructor(payload, uuid = uuidV4()) {
    this.payload = payload;
    this.uuid = uuid;
  }

  get type() {
    return typeof this.payload;
  }

  toString() {
    return JSON.stringify({ payload: this.payload, uuid: this.uuid });
  }

  static clone(messageObject) {
    return new WsMessage(messageObject.payload, messageObject.uuid);
  }

  static fromString(string) {
    const messageObject = JSON.parse(string);
    return WsMessage.clone(messageObject);
  }

  static fromEvent(event) {
    if (typeof event.data === 'string') {
      return WsMessage.fromString(event.data);
    } else {
      return new WsMessage(event.data);
    }
  }
}

module.exports = WsMessage;
