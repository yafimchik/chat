import { ACTIONS } from '@/chat-engine-client/chat-engine.client.constants';
import MessageGenerator from '@/chat-engine-client/message.generator';
import SendMessageError from '@/chat-engine-client/errors/send.message.error';

function ChatEngineClientRequestInterfaceMixin() {
  /*
  uses this.sendMessage(), this.sendMessageAsync(), this.getClient(), this.virtualServers
   */
  this.messageGenerator = new MessageGenerator();

  this.initializeRequestInterface = function (token) {
    this.messageGenerator.initToken(token);
  };

  this.getAllChats = async function () {
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
  };

  this.getAllVoiceChannels = async function () {
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
  };

  this.getAllHistory = async function (chatsArray) {
    try {
      const result = await Promise.all(
        chatsArray.map((chat) => this.getHistory(chat.virtualServer, chat._id, 0)),
      );
      if (!result) return [];
      return result.flat();
    } catch (e) {
      return [];
    }
  };

  this.sendFullMessage = async function (virtualServer, chat, messageObject) {
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
  };

  this.sendFile = async function (virtualServer, fileRecord) {
    const info = { ...fileRecord };
    delete info.file;
    return this.sendBinary(virtualServer, info, fileRecord.file, ACTIONS.fileInfo);
  };

  this.sendAudio = async function (virtualServer, audioRecord) {
    const info = { ...audioRecord };
    delete info.audio;
    return this.sendBinary(virtualServer, info, audioRecord.audio, ACTIONS.audioInfo);
  };

  this.sendBinary = async function (virtualServer, info, data, action = ACTIONS.audioInfo) {
    const infoResult = await this.sendBinaryInfo(virtualServer, info, action);
    if (infoResult.error) throw new SendMessageError();

    const connection = this.getClient(virtualServer);
    if (!connection) throw new SendMessageError();

    const binaryResult = await connection.socket.sendBinaryAsync(data);
    if (binaryResult.error) throw new SendMessageError();
    return binaryResult;
  };

  this.sendBinaryInfo = async function (virtualServer, binaryInfo, action = ACTIONS.audioInfo) {
    const message = this.messageGenerator.binaryInfo(binaryInfo, action);
    return this.sendMessageAsync(virtualServer, message);
  };

  this.sendMessageHeader = async function (virtualServer, chat, messageObject) {
    const message = this.messageGenerator.messageHeader(chat, messageObject);
    return this.sendMessageAsync(virtualServer, message);
  };

  this.sendMessageFooter = async function (virtualServer) {
    const message = this.messageGenerator.messageFooter();
    return this.sendMessageAsync(virtualServer, message);
  };

  this.sendStatus = function (virtualServer, status) {
    const message = this.messageGenerator.status(status);
    this.sendMessage(virtualServer, message);
  };

  this.sendText = async function (virtualServer, chat, text) {
    const message = this.messageGenerator.text(chat, text);
    return this.sendMessageAsync(virtualServer, message);
  };

  this.getHistory = async function (virtualServer, chat, offset) {
    const message = this.messageGenerator.historyRequest(chat, offset);
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.history;
  };

  this.getChats = async function (virtualServer) {
    const message = this.messageGenerator.chatsRequest();
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.chats;
  };

  this.getVoiceChannels = async function (virtualServer) {
    const message = this.messageGenerator.voiceChannelsRequest();
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.voiceChannels;
  };

  this.createVoiceChannel = async function (virtualServer, name) {
    const message = this.messageGenerator.createVoiceChannel(name);
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return undefined;
    return result;
  };

  this.deleteVoiceChannel = async function (virtualServer, id) {
    const message = this.messageGenerator.deleteVoiceChannel(id);
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return undefined;
    return result;
  };

  this.getContacts = async function (virtualServer) {
    const message = this.messageGenerator.contactsRequest();
    const result = await this.sendMessageAsync(virtualServer, message);
    if (!result) return [];
    return result.contacts;
  };

  this.sendOffer = async function (virtualServer, voiceChannel, contact, offer) {
    const message = this.messageGenerator.offer(voiceChannel, contact, offer);
    return this.sendMessageAsync(virtualServer, message);
  };

  this.sendAnswer = function (virtualServer, voiceChannel, contact, answer, uniqueMessageId) {
    const message = this.messageGenerator.answer(voiceChannel, contact, answer, uniqueMessageId);
    return this.sendMessage(virtualServer, message);
  };

  this.sendIce = function (virtualServer, voiceChannel, contact, ice) {
    const message = this.messageGenerator.ice(voiceChannel, contact, ice);
    return this.sendMessage(virtualServer, message);
  };
}

export default ChatEngineClientRequestInterfaceMixin;
