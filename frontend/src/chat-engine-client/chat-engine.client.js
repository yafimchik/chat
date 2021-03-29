import { VOICE_CHANNEL_SERVICE_ACTIONS } from '@/chat-engine-client/chat-engine.client.constants';
import VoiceChannel from '@/chat-engine-client/voice-channel/voice-channel';
import ClientError from './errors/client.error';
import ChatEngineClientConnection from './chat-engine.client.connection';
import ServerError from './errors/server.error';
import ConnectionError from './errors/connection.error';
import SendMessageError from "@/chat-engine-client/errors/send.message.error";
import ChatInterface from '@/chat-engine-client/chat/chat.interface';
import VoiceChannelInterface from "@/chat-engine-client/voice-channel/voice-channel.interface";

class ChatEngineClient {
  constructor(
    apiUrl,
    onUpdateCallback = () => {},
    onInputStreamCallback = () => {},
    onCloseConnectionCallback = () => {},
    onVoiceDetectionEventCallback = () => {},
  ) {
    this.apiUrl = apiUrl;
    this.wsUrl = `${this.apiUrl.replace('http', 'ws')}/wss`;
    this.user = undefined;
    this.servers = {};
    this.token = undefined;
    this.onUpdateCallback = onUpdateCallback;

    this.voiceChannel = new VoiceChannel(
      onInputStreamCallback,
      onCloseConnectionCallback,
      this.onException.bind(this),
      onVoiceDetectionEventCallback,
    );
    this.connectToVoiceChannel = this.voiceChannel.connectToChannel.bind(this.voiceChannel);
    this.disconnectFromVoiceChannel = this.voiceChannel.disconnect.bind(this.voiceChannel);
    this.onContactDisconnect = this.voiceChannel.onContactDisconnect.bind(this.voiceChannel);
    this.switchMicrophone = this.voiceChannel.switchMicrophone.bind(this.voiceChannel);
  }

  get microphoneMuted() {
    return this.voiceChannel.microphoneMuted;
  }

  static async postToUrl(url, data) {
    const body = JSON.stringify(data);
    const requestInit = {
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
      body,
    };
    try {
      const response = await fetch(url, requestInit);
      return (await response.json());
    } catch (e) {
      this.onException(e);
      return undefined;
    }
  }

  async login(username) {
    const loginResult = await ChatEngineClient
      .postToUrl(`${this.apiUrl}/users/login`, { username, password: 'sss' });
    return this.initializeAuth(loginResult);
  }

  async register(username) {
    const registerResult = await ChatEngineClient
      .postToUrl(`${this.apiUrl}/users/register`, { username, password: 'sss' });
    return this.initializeAuth(registerResult);
  }

  initializeAuth(authResponse) {
    if (!authResponse) return null;
    if (!authResponse.user) return null;
    this.user = { ...authResponse.user };
    this.token = authResponse.token;

    this.chatInterface = new ChatInterface(
      this.token,
      this.sendMessage.bind(this),
      this.sendMessageAsync.bind(this),
      this.sendBinaryAsync.bind(this),
      this.getVirtualServers.bind(this),
    );

    this.voiceChannelInterface = new VoiceChannelInterface(
      this.token,
      this.sendMessage.bind(this),
      this.sendMessageAsync.bind(this),
    );

    this.voiceChannel.setUser(this.user);
    this.voiceChannel.setConnectionConfig(authResponse.config.webRTCConfig);

    this.servers = {};
    authResponse.user.virtualServers.forEach((vs) => {
      const url = `${this.wsUrl}/${vs._id}`;
      const id = vs._id;
      this.servers[id] = {
        url,
        id,
        client: new ChatEngineClientConnection(
          url, this.token, id,
          this.onMessage.bind(this),
          this.onError.bind(this),
        ),
      };
    });

    const virtualServers = [...authResponse.user.virtualServers];
    const user = { ...authResponse.user };
    delete user.virtualServers;
    const token = authResponse.token.slice();

    return { user, token, virtualServers };
  }

  async connect() {
    try {
      const serversArray = Object.values(this.servers);
      if (!serversArray.length) return false;
      const results = await Promise.all(
        serversArray.map((server) => server.client.connectToServer()),
      );
      return !results.some((result) => !result);
    } catch (e) {
      this.onException(e);
      return false;
    }
  }

  async disconnect() {
    try {
      const serversArray = Object.values(this.servers);
      const results = await Promise.all(serversArray.map((server) => server.client.disconnect()));
      return !results.some((result) => !result);
    } catch (e) {
      this.onException(e);
      return false;
    }
  }

  async onMessage(virtualServer, message) {
    if (message.error) {
      const event = { ...message };
      event.error.serverError = true;
    } else if (VOICE_CHANNEL_SERVICE_ACTIONS.includes(message.action)) {
      if (message.offer) {
        await this.voiceChannel.onOffer(virtualServer, message);
      } else if (message.ice) {
        await this.voiceChannel.onIce(message);
      }
      return;
    }

    const answer = { message, virtualServer };
    this.onUpdateCallback(answer);
  }

  onError(virtualServer, event) {
    this.onUpdateCallback({
      virtualServer,
      message: { error: event },
    });
  }

  sendMessage(virtualServer, message) {
    const connection = this.getConnection(virtualServer);
    if (!connection) {
      this.onException(new Error('There is not any connection to server!'));
    }
    connection.socket.send(message);
  }

  async sendMessageAsync(virtualServer, message, defaultValue) {
    const connection = this.getConnection(virtualServer);
    if (!connection) {
      this.onException(new ClientError('There is not any connection to server!'));
      return defaultValue;
    }
    try {
      return await (connection.socket.sendAsync(message));
    } catch (e) {
      this.onException(e);
      return defaultValue;
    }
  }

  async sendMessageAsync(virtualServer, message, defaultValue) {
    const connection = this.getConnection(virtualServer);
    if (!connection) {
      this.onException(new ClientError('There is not any connection to server!'));
      return defaultValue;
    }
    try {
      return await (connection.socket.sendAsync(message));
    } catch (e) {
      this.onException(e);
      return defaultValue;
    }
  }

  async sendBinaryAsync(virtualServer, data) {
    const connection = this.getConnection(virtualServer);
    if (!connection) throw new SendMessageError();
    const binaryResult = await connection.socket.sendBinaryAsync(data);
    if (binaryResult.error) throw new SendMessageError();
    return binaryResult;
  }

  getVirtualServers() {
    if (!this.user) return [];
    if (!this.user.virtualServers) return [];
    return this.user.virtualServers.map((vs) => vs._id);
  }

  get virtualServers() {
    if (!this.user) return [];
    if (!this.user.virtualServers) return [];
    return this.user.virtualServers.map((vs) => vs._id);
  }

  getConnection(virtualServer) {
    const serversArray = Object.values(this.servers);
    if (!serversArray || !serversArray.length) return undefined;

    if (virtualServer) return this.servers[virtualServer].client;

    const index = Math.round(Math.random() * (serversArray.length - 1));
    return serversArray[index].client;
  }

  onException(error, fromClient = false) {
    console.error(error);
    let clientError = error instanceof ClientError;
    const serverError = error instanceof ServerError;
    const connectionError = error instanceof ConnectionError;
    if (fromClient) clientError = true;
    const event = {
      error,
      clientError,
      serverError,
      connectionError,
    };
    this.onError(undefined, event);
  }
}

export default ChatEngineClient;
