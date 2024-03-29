import AsyncSocket from './async-socket/async-socket';
import { ACTIONS, CONNECTION_STATUSES } from './chat-engine.client.constants';
import SendMessageError from './errors/send.message.error';

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
    this.connectionStatuses = CONNECTION_STATUSES;
    this.connectionStatus = this.connectionStatuses.CLOSED;
    this.reconnectsAfterError = 0;
  }

  async connectToServer(reconnect = false) {
    if (!this.serverUrl) return false;
    this.connectionStatus = this.connectionStatuses.OPENING;

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
    if (result) {
      await this.sendToken();
      this.connectionStatus = this.connectionStatuses.OPENED;
    }
    return result;
  }

  async disconnect(code, reason) {
    this.connectionStatus = this.connectionStatuses.CLOSING;
    const result = await this.socket.disconnectAsync(code, reason);
    if (result) this.connectionStatus = this.connectionStatuses.CLOSED;
    return result;
  }

  onMessage(message) {
    if (this.onMessageCallback) this.onMessageCallback(this.virtualServerId, message);
  }

  async onError(event) {
    this.errorsCount += 1;
    console.log('on error ', event);

    let isConnectionBad = false;

    try {
      if (this.errorsCount >= this.errorsToReconnect || this.isClosed) {
        if (!this.reconnectsAfterError) {
          this.reconnectsAfterError += 1;
          await this.disconnect();
          isConnectionBad = !(await this.connectToServer());
          if (!isConnectionBad) this.errorsCount = 0;
        }
      }
    } catch (e) {
      this.onErrorCallback(this.virtualServerId, event);
    }
    if (isConnectionBad && this.onErrorCallback) this.onErrorCallback(this.virtualServerId, event);
  }

  onOpen() {
    console.log('opened ', this.virtualServerId);
  }

  async onClose() {
    const isClosingOrClosed = this.isClosed || this.isClosing;
    this.connectionStatus = this.connectionStatuses.CLOSED;

    if (isClosingOrClosed) return;
    const event = { error: { message: 'connection suddenly closed!' } };
    await this.onError(event);
  }

  sendStatus(status) {
    console.log('send status ', status);
    return this.socket.send({
      status,
      token: this.token,
      action: ACTIONS.status,
    });
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

  async sendFullMessage(chat, messageObject) {
    if (!messageObject.audio && !messageObject.files) {
      return this.sendText(chat, messageObject.text);
    }
    const message = await this.sendMessageHeader(chat, messageObject);
    if (message.error) {
      console.debug(message.error);
      throw new SendMessageError();
    }
    if (messageObject.audio) {
      await this.sendAudio(messageObject.audio);
    }
    if (messageObject.files) {
      let tasksChain = Promise.resolve();
      messageObject.files.forEach((file) => {
        tasksChain = tasksChain.then(() => this.sendFile(file));
      });

      await tasksChain;
      // for (let file of messageObject.files) {
      //   await this.sendFile(file);
      // }
    }
    return this.sendMessageFooter(chat, messageObject);
  }

  async sendFile(fileRecord) {
    const info = { ...fileRecord };
    delete info.file;
    return this.sendBinary(info, fileRecord.file, ACTIONS.fileInfo);
  }

  async sendAudio(audioRecord) {
    const info = { ...audioRecord };
    delete info.audio;
    return this.sendBinary(info, audioRecord.audio);
  }

  async sendBinary(info, data, action = ACTIONS.audioInfo) {
    console.log('binary type ', data);
    const infoResult = await this.sendBinaryInfo(info, action);
    if (infoResult.error) throw new SendMessageError();
    const binaryResult = await this.socket.sendBinaryAsync(data);
    if (binaryResult.error) throw new SendMessageError();
    return binaryResult;
  }

  async sendBinaryInfo(binaryInfo, action = ACTIONS.audioInfo) {
    console.log('info ', binaryInfo);
    return this.socket.sendAsync({
      binaryInfo,
      token: this.token,
      action,
    });
  }

  async sendMessageHeader(chat, messageObject) {
    const header = {
      text: messageObject.text,
    };
    return this.socket.sendAsync({
      ...header,
      chat,
      token: this.token,
      action: ACTIONS.messageHeader,
    });
  }

  async sendMessageFooter() {
    return this.socket.sendAsync({
      token: this.token,
      action: ACTIONS.messageFooter,
    });
  }

  async getHistory(chat, offset) {
    return this.socket.sendAsync({
      offset,
      chat,
      token: this.token,
      action: ACTIONS.getHistory,
    });
  }

  async getChats() {
    return this.socket.sendAsync({ token: this.token, action: ACTIONS.getChats });
  }

  async getContacts() {
    return this.socket.sendAsync({ token: this.token, action: ACTIONS.getContacts });
  }

  get isClosed() {
    return this.connectionStatus === this.connectionStatuses.CLOSED;
  }

  get isClosing() {
    return this.connectionStatus === this.connectionStatuses.CLOSING;
  }

  get isOpening() {
    return this.connectionStatus === this.connectionStatuses.OPENING;
  }

  get isOpened() {
    return this.connectionStatus === this.connectionStatuses.OPENED;
  }
}

export default ChatEngineClientConnection;
