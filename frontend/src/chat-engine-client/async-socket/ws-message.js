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

  static clone(messageObject) {
    return new WsMessage(messageObject.payload, messageObject.uuid);
  }

  static fromString(string) {
    console.log('from string ', string);
    const messageObject = JSON.parse(string);
    return WsMessage.clone(messageObject);
  }

  static fromEvent(event) {
    console.log('from event', event.data);
    if (typeof event.data === 'string') {
      return WsMessage.fromString(event.data);
    }
    return new WsMessage(event.data);
  }
}

export default WsMessage;
