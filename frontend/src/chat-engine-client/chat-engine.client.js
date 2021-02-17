import { VOICE_CHANNEL_SERVICE_ACTIONS } from '@/chat-engine-client/chat-engine.client.constants';
import VoiceChannel from '@/chat-engine-client/voice-channel/voice-channel';
import ClientError from './errors/client.error';
import ChatEngineClientConnection from './chat-engine.client.connection';
import ServerError from './errors/server.error';
import ConnectionError from './errors/connection.error';

class ChatEngineClient {
  constructor(
    apiUrl,
    onUpdateCallback = () => {},
    onInputStreamCallback = () => {},
    onCloseConnectionCallback = () => {},
  ) {
    this.apiUrl = apiUrl;
    this.wsUrl = `${this.apiUrl.replace('http', 'ws')}/wss`;
    this.user = undefined;
    this.servers = {};
    this.token = undefined;
    this.onUpdateCallback = onUpdateCallback;

    this.voiceChannel = new VoiceChannel(
      undefined,
      this.sendIce.bind(this),
      this.sendOffer.bind(this),
      this.sendAnswer.bind(this),
      onInputStreamCallback,
      onCloseConnectionCallback,
      this.onException.bind(this),
    );
    this.connectToVoiceChannel = this.voiceChannel.connectToChannel.bind(this.voiceChannel);
    this.disconnectFromVoiceChannel = this.voiceChannel.disconnect.bind(this.voiceChannel);
    this.onContactDisconnect = this.voiceChannel.onContactDisconnect.bind(this.voiceChannel);
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

  async getAllChats() {
    try {
      const results = await Promise.all(this.virtualServers.map((vsId) => this.getChats(vsId)));
      const chatsFromServer = results.flat();
      const chats = {};
      chatsFromServer.forEach((chat) => {
        if (!chats[chat.virtualServer]) chats[chat.virtualServer] = [];
        chats[chat.virtualServer].push(chat);
      });
      return chats;
    } catch (e) {
      this.onException(e);
      return {};
    }
  }

  async getAllVoiceChannels() {
    try {
      const results = await Promise.all(
        this.virtualServers.map((vsId) => this.getVoiceChannels(vsId)),
      );
      const voiceChannelsArray = results.flat();
      const voiceChannels = {};
      voiceChannelsArray.forEach((voiceChannel) => {
        const { virtualServer } = voiceChannel;
        if (!voiceChannels[virtualServer]) voiceChannels[virtualServer] = [];
        voiceChannels[virtualServer].push(voiceChannel);
      });
      return voiceChannels;
    } catch (e) {
      this.onException(e);
      return {};
    }
  }

  async getAllHistory(chatsArray) {
    try {
      const result = await Promise.all(
        chatsArray.map((chat) => this.getHistory(chat.virtualServer, chat._id, 0)),
      );
      if (!result) return [];
      return result.flat();
    } catch (e) {
      this.onException(e);
      return [];
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

  sendStatus(virtualServer, status) {
    return this.safeRequest('sendStatus', [], virtualServer, status);
  }

  async sendToken(virtualServer) {
    return this.safeRequest('sendToken', undefined, virtualServer);
  }

  async sendText(virtualServer, chat, text) {
    return this.safeRequest('sendText', undefined, virtualServer, chat, text);
  }

  async sendFullMessage(virtualServer, chat, messageObject) {
    return this.safeRequest(
      'sendFullMessage', undefined,
      virtualServer, chat, messageObject,
    );
  }

  async getHistory(virtualServer, chat, offset) {
    return this.safeRequest('getHistory', [], virtualServer, chat, offset);
  }

  async getChats(virtualServer) {
    return this.safeRequest('getChats', [], virtualServer);
  }

  async getVoiceChannels(virtualServer) {
    return this.safeRequest('getVoiceChannels', [], virtualServer);
  }

  async getContacts() {
    return this.safeRequest('getContacts', []);
  }

  async sendOffer(virtualServer, voiceChannel, contact, offer) {
    return this.safeRequest('sendOffer', undefined, virtualServer, voiceChannel, contact, offer);
  }

  async sendAnswer(virtualServer, voiceChannel, contact, answer, uniqueMessageId) {
    return this.safeRequest(
      'sendAnswer', undefined,
      virtualServer, voiceChannel, contact, answer, uniqueMessageId,
    );
  }

  async sendIce(virtualServer, voiceChannel, contact, ice) {
    return this.safeRequest('sendIce', undefined, virtualServer, voiceChannel, contact, ice);
  }

  async safeRequest(requestName, defaultValue = {}, virtualServer, ...params) {
    const connection = this.getClient(virtualServer);
    if (!connection) {
      this.onException(new Error('There is not any connection to server!'));
      return defaultValue;
    }
    try {
      return connection[requestName](...params);
    } catch (e) {
      return defaultValue;
    }
  }

  get virtualServers() {
    if (!this.user) return [];
    if (!this.user.virtualServers) return [];
    return this.user.virtualServers.map((vs) => vs._id);
  }

  getClient(virtualServer) {
    const serversArray = Object.values(this.servers);
    if (!serversArray || !serversArray.length) return undefined;

    if (virtualServer) return this.servers[virtualServer].client;

    const index = Math.round(Math.random() * (serversArray.length - 1));
    return serversArray[index].client;
  }

  onException(error, fromClient = false) {
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
