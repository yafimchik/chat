import {
  ACTIONS,
  VOICE_CHANNEL_SERVICE_ACTIONS,
} from '@/chat-engine-client/chat-engine.client.constants';
import VoiceChannel from '@/chat-engine-client/voice-channel/voice-channel';
import MessageGenerator from '@/chat-engine-client/message.generator';
import SendMessageError from '@/chat-engine-client/errors/send.message.error';
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
    onVoiceDetectionEventCallback = () => {},
  ) {
    this.apiUrl = apiUrl;
    this.wsUrl = `${this.apiUrl.replace('http', 'ws')}/wss`;
    this.user = undefined;
    this.servers = {};
    this.token = undefined;
    this.onUpdateCallback = onUpdateCallback;

    this.messageGenerator = new MessageGenerator();

    this.voiceChannel = new VoiceChannel(
      undefined,
      this.sendIce.bind(this),
      this.sendOffer.bind(this),
      this.sendAnswer.bind(this),
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
    this.messageGenerator.initToken(this.token);

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

  async sendFullMessage(virtualServer, chat, messageObject) {
    if (!messageObject.audio && !messageObject.files) {
      return this.sendText(virtualServer, chat, messageObject.text);
    }

    try {
      const message = await this.sendMessageHeader(virtualServer, chat, messageObject);
      if (message.error) return undefined;

      if (messageObject.audio) {
        await this.sendAudio(virtualServer, messageObject.audio);
      }
      if (messageObject.files) {
        let tasksChain = Promise.resolve();
        messageObject.files.forEach((file) => {
          tasksChain = tasksChain.then(() => this.sendFile(virtualServer, file));
        });
        await tasksChain;
      }
      return this.sendMessageFooter(virtualServer);
    } catch (e) {
      this.onException(e);
      return undefined;
    }
  }

  async sendFile(virtualServer, fileRecord) {
    const info = { ...fileRecord };
    delete info.file;
    return this.sendBinary(virtualServer, info, fileRecord.file, ACTIONS.fileInfo);
  }

  async sendAudio(virtualServer, audioRecord) {
    const info = { ...audioRecord };
    delete info.audio;
    return this.sendBinary(virtualServer, info, audioRecord.audio, ACTIONS.audioInfo);
  }

  async sendBinary(virtualServer, info, data, action = ACTIONS.audioInfo) {
    const infoResult = await this.sendBinaryInfo(virtualServer, info, action);
    if (infoResult.error) throw new SendMessageError();

    const connection = this.getClient(virtualServer);
    if (!connection) throw new SendMessageError();

    const binaryResult = await connection.socket.sendBinaryAsync(data);
    if (binaryResult.error) throw new SendMessageError();
    return binaryResult;
  }

  async sendBinaryInfo(virtualServer, binaryInfo, action = ACTIONS.audioInfo) {
    const message = this.messageGenerator.binaryInfo(binaryInfo, action);
    return this.sendMessageAsync(virtualServer, message);
  }

  async sendMessageHeader(virtualServer, chat, messageObject) {
    const message = this.messageGenerator.messageHeader(chat, messageObject);
    return this.sendMessageAsync(virtualServer, message);
  }

  async sendMessageFooter(virtualServer) {
    const message = this.messageGenerator.messageFooter();
    return this.sendMessageAsync(virtualServer, message);
  }

  sendStatus(virtualServer, status) {
    const message = this.messageGenerator.status(status);
    this.sendMessage(virtualServer, message);
  }

  async sendText(virtualServer, chat, text) {
    const message = this.messageGenerator.text(chat, text);
    return this.sendMessageAsync(virtualServer, message);
  }

  async getHistory(virtualServer, chat, offset) {
    const message = this.messageGenerator.historyRequest(chat, offset);
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.history;
  }

  async getChats(virtualServer) {
    const message = this.messageGenerator.chatsRequest();
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.chats;
  }

  async getVoiceChannels(virtualServer) {
    const message = this.messageGenerator.voiceChannelsRequest();
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.voiceChannels;
  }

  async createVoiceChannel(virtualServer, name) {
    const message = this.messageGenerator.createVoiceChannel(name);
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return undefined;
    return result;
  }

  async getContacts(virtualServer) {
    const message = this.messageGenerator.contactsRequest();
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.contacts;
  }

  async sendOffer(virtualServer, voiceChannel, contact, offer) {
    const message = this.messageGenerator.offer(voiceChannel, contact, offer);
    return this.sendMessageAsync(virtualServer, message);
  }

  sendAnswer(virtualServer, voiceChannel, contact, answer, uniqueMessageId) {
    const message = this.messageGenerator.answer(voiceChannel, contact, answer, uniqueMessageId);
    return this.sendMessage(virtualServer, message);
  }

  sendIce(virtualServer, voiceChannel, contact, ice) {
    const message = this.messageGenerator.ice(voiceChannel, contact, ice);
    return this.sendMessage(virtualServer, message);
  }

  sendMessage(virtualServer, message) {
    const connection = this.getClient(virtualServer);
    if (!connection) {
      this.onException(new Error('There is not any connection to server!'));
    }
    connection.socket.send(message);
  }

  async sendMessageAsync(virtualServer, message, defaultValue) {
    const connection = this.getClient(virtualServer);
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
