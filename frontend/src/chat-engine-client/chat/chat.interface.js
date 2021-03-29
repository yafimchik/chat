import { ACTIONS } from '@/chat-engine-client/chat-engine.client.constants';
import ChatMessageGenerator from '@/chat-engine-client/chat/chat.message.generator';
import SendMessageError from '@/chat-engine-client/errors/send.message.error';

export default class ChatInterface {
  constructor(token, sendMessageFn, sendMessageAsyncFn, sendBinaryAsyncFn, getVirtualServersFn) {
    this.token = token;

    this.sendMessage = sendMessageFn;
    this.sendMessageAsync = sendMessageAsyncFn;
    this.sendBinaryAsync = sendBinaryAsyncFn;
    this.getVirtualServers = getVirtualServersFn;

    this.messageGenerator = new ChatMessageGenerator(token);
  }

  get virtualServers() {
    return this.getVirtualServers();
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
      return [];
    }
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
    return this.sendBinaryAsync(virtualServer, data);
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

  async deleteVoiceChannel(virtualServer, id) {
    const message = this.messageGenerator.deleteVoiceChannel(id);
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
}
