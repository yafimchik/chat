import { v4 as uuidv4 } from 'uuid';

class WsMessage {
  constructor(payload, uuid = uuidv4()) {
    this.payload = payload;
    this.uuid = uuid;
  }

  get type() {
    return typeof this.payload;
  }

  toString() {
    return JSON.stringify({ payload: this.payload, uuid: this.uuid });
  }

  static clone(messageObj) {
    return new WsMessage(messageObj.payload, messageObj.uuid);
  }

  static fromString(string) {
    const messageObj = JSON.parse(string);
    return WsMessage.clone(messageObj);
  }

  static fromEvent(event) {
    if (typeof event.data === 'string') {
      return WsMessage.fromString(event.data);
    }
    return new WsMessage(event.data);
  }
}

export default WsMessage;
