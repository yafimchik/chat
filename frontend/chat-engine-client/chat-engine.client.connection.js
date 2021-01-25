import AsyncSocket from './async-socket/async-socket';
import { ACTIONS } from './chat-engine.client.constants';

class ChatEngineClientConnection {
  constructor(
    serverUrl,
    token,
    virtualServerId,
    onMessageCallback,
    onErrorCallback,
    errorsToReconnect = 3,
  ) {
    this.virtualServerId = virtualServerId;
    this.serverUrl = serverUrl;
    this.token = token;
    this.socket = null;
    this.onMessageCallback = onMessageCallback;
    this.onErrorCallback = onErrorCallback;
    this.errorsCount = 0;
    this.errorsToReconnect = errorsToReconnect;
  }

  async connectToServer(reconnect = false) {
    console.log('server ws Url ', this.serverUrl);
    if (!this.serverUrl) return false;

    this.socket = new AsyncSocket({
      url: this.serverUrl,
      onOpenCallback: this.onOpen.bind(this),
      onMessageCallback: this.onMessage.bind(this),
      onCloseCallback: this.onClose.bind(this),
      onErrorCallback: this.onError.bind(this),
    });

    let result = await this.socket.connectAsync();
    console.log('connected or not: ', result);

    if (!result && !reconnect) result = await this.connectToServer(true);
    if (result) await this.sendToken();
    return result;
  }

  async disconnect(code, reason) {
    return this.socket.disconnectAsync(code, reason);
  }

  onMessage(message) {
    if (this.onMessageCallback) this.onMessageCallback(this.virtualServerId, message);
  }

  async onError(event) {
    this.errorsCount += 1;
    console.log(event);

    // TODO test reconnection on multiple errors.
    let isConnectionBad;
    if (this.errorsCount >= this.errorsToReconnect) {
      await this.disconnect();
      isConnectionBad = !(await this.connectToServer());
    }

    if (this.onErrorCallback) this.onErrorCallback(this.virtualServerId, event, isConnectionBad);
  }

  onOpen() {
    console.log('opened ', this.virtualServerId);
    // this
    // console.log(event);
  }

  onClose() {
    console.log('closed ', this.virtualServerId);
    // console.log(event);
  }

  // TODO AFTER sending files
  // async sendFile(image, { virtualServer, chat }) {
  //   const startbin
  // }

  sendStatus(status) {
    return this.socket.send({ status, token: this.token, action: ACTIONS.status });
  }

  async sendToken() {
    return this.socket.sendAsync({ token: this.token, action: ACTIONS.userInfo });
  }

  async sendText(chat, text) {
    return this.socket.sendAsync({
      text,
      chat,
      token: this.token,
      action: ACTIONS.text,
    });
  }

  async getHistory(chat) {
    return this.socket.sendAsync({ chat, token: this.token, action: ACTIONS.getHistory });
  }

  async getChats(offset) {
    return this.socket.sendAsync({ offset, token: this.token, action: ACTIONS.getChats });
  }

  async getContactsOnline() {
    return this.socket.sendAsync({ token: this.token, action: ACTIONS.getContactsOnline });
  }

  async getContacts() {
    return this.socket.sendAsync({ token: this.token, action: ACTIONS.getContacts });
  }
}

export default ChatEngineClientConnection;
