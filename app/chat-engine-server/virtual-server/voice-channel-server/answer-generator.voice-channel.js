const WsMessage = require('../ws-message');
const { ACTIONS } = require('../../chat-engine.client.constants');
const { VOICE_CHANNEL_SUB_ACTIONS } = require('./voice-channel.constants');

class AnswerGeneratorVoiceChannel {
  static fromConnections(connectionInfo) {
    return new WsMessage({
      ...connectionInfo,
      action: ACTIONS.voiceChannelServiceMessage,
      subAction: VOICE_CHANNEL_SUB_ACTIONS.newConnections,
    });
  }
}

module.exports = AnswerGeneratorVoiceChannel;
