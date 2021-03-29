import { ACTIONS } from '@/chat-engine-client/chat-engine.client.constants';

export default class VoiceChannelMessageGenerator {
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

  connected() {
    return {
      token: this.token,
      action: ACTIONS.voiceChannelServiceMessage,
    };
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

  CreateP2PConnectionMessage(voiceChannel, contact, isOutputConnection) {
    return {
      voiceChannel,
      isOutputConnection,
      token: this.token,
      action: ACTIONS.voiceChannelIce,
      to: contact,
    };
  }
}
