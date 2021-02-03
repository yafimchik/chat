import { v4 as uuidv4 } from 'uuid';

class WsMessage {
  constructor(payload, uuid = uuidv4(), binarySent = false) {
    this.payload = payload;
    this.uuid = uuid;
    this.binarySent = binarySent;
  }

  get type() {
    return typeof this.payload;
  }

  toString() {
    return JSON.stringify({ payload: this.payload, uuid: this.uuid, binarySent: this.binarySent });
  }

  static clone(messageObject) {
    return new WsMessage(messageObject.payload, messageObject.uuid, messageObject.binarySent);
  }

  static fromString(string) {
    const messageObject = JSON.parse(string);
    return WsMessage.clone(messageObject);
  }

  static fromEvent(event) {
    if (typeof event.data === 'string') {
      return WsMessage.fromString(event.data);
    }
    return new WsMessage(event.data);
  }
}

export default WsMessage;
