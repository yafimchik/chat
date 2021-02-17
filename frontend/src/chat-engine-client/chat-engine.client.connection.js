import AsyncSocket from './async-socket/async-socket';
import { ACTIONS, CONNECTION_STATUSES } from './chat-engine.client.constants';

class ChatEngineClientConnection {
  constructor(
    serverUrl,
    token,
    virtualServerId,
    onMessageCallback = () => {},
    onErrorCallback = () => {},
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

    if (!result && !reconnect) result = await this.connectToServer(true);
    if (result) {
      await this.sendToken();
      this.connectionStatus = this.connectionStatuses.OPENED;
    }
    return result;
  }

  async sendToken() {
    return this.socket.sendAsync({ token: this.token, action: ACTIONS.userInfo });
  }

  async disconnect(code, reason) {
    this.connectionStatus = this.connectionStatuses.CLOSING;
    const result = await this.socket.disconnectAsync(code, reason);
    if (result) this.connectionStatus = this.connectionStatuses.CLOSED;
    return result;
  }

  onMessage(message) {
    this.onMessageCallback(this.virtualServerId, message);
  }

  async onError(event) {
    this.errorsCount += 1;

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
    if (isConnectionBad) this.onErrorCallback(this.virtualServerId, event);
  }

  onOpen() {
    console.log('opened virtualServer ', this.virtualServerId);
  }

  async onClose() {
    const isClosingOrClosed = this.isClosed || this.isClosing;
    this.connectionStatus = this.connectionStatuses.CLOSED;

    if (isClosingOrClosed) return;
    const event = { error: { message: 'connection suddenly closed!' } };
    await this.onError(event);
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
