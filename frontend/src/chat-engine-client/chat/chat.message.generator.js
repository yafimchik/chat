import { ACTIONS } from '@/chat-engine-client/chat-engine.client.constants';

export default class ChatMessageGenerator {
  constructor(token) {
    this.token = token;
  }

  status(status) {
    return {
      status,
      token: this.token,
      action: ACTIONS.status,
    };
  }

  text(chat, text) {
    return {
      text,
      chat,
      token: this.token,
      action: ACTIONS.text,
    };
  }

  binaryInfo(binaryInfo, action = ACTIONS.audioInfo) {
    return {
      binaryInfo,
      token: this.token,
      action,
    };
  }

  messageHeader(chat, messageObject) {
    return {
      text: messageObject.text,
      chat,
      token: this.token,
      action: ACTIONS.messageHeader,
    };
  }

  messageFooter() {
    return { token: this.token, action: ACTIONS.messageFooter };
  }

  historyRequest(chat, offset) {
    return {
      offset,
      chat,
      token: this.token,
      action: ACTIONS.getHistory,
    };
  }

  chatsRequest() {
    return { token: this.token, action: ACTIONS.getChats };
  }

  voiceChannelsRequest() {
    return { token: this.token, action: ACTIONS.getVoiceChannels };
  }

  createVoiceChannel(name) {
    return {
      name,
      token: this.token,
      action: ACTIONS.createVoiceChannel,
    };
  }

  deleteVoiceChannel(voiceChannelId) {
    return {
      voiceChannelId,
      token: this.token,
      action: ACTIONS.deleteVoiceChannel,
    };
  }

  contactsRequest() {
    return { token: this.token, action: ACTIONS.getContacts };
  }
}
