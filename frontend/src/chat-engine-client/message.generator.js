import { ACTIONS } from '@/chat-engine-client/chat-engine.client.constants';

export default class MessageGenerator {
  constructor(token) {
    this.token = token;
  }

  initToken(token) {
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

  contactsRequest() {
    return { token: this.token, action: ACTIONS.getContacts };
  }

  offer(voiceChannel, contact, offer) {
    return {
      voiceChannel,
      offer,
      token: this.token,
      action: ACTIONS.voiceChannelOffer,
      to: contact,
    };
  }

  answer(voiceChannel, contact, answer, uniqueMessageId) {
    return {
      uniqueMessageId,
      voiceChannel,
      answer,
      token: this.token,
      action: ACTIONS.voiceChannelAnswer,
      to: contact,
    };
  }

  ice(voiceChannel, contact, ice) {
    return {
      voiceChannel,
      ice,
      token: this.token,
      action: ACTIONS.voiceChannelIce,
      to: contact,
    };
  }
}
