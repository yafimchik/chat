const P2PNetwork = require('./p2p-network');
const AnswerGeneratorVoiceChannel = require('./answer-generator.voice-channel');
const { ACTIONS } = require('../../chat-engine.client.constants');
const { VOICE_CHANNEL_SUB_ACTIONS, VOICE_CHANNEL_USER_ROLES } = require('./voice-channel.constants');

class VoiceChannelServer {
  constructor(voiceChannelInfo, virtualServer) {
    this.id = voiceChannelInfo._id;
    this.voiceChannel = voiceChannelInfo;
    this.p2p = new P2PNetwork();
    this.answerGenerator = new AnswerGeneratorVoiceChannel();
    this.virtualServer = virtualServer;
  }

  get status() {
    return this.virtualServer.serverStatus;
  }

  getUserStatus(userId) {
    return this.status.find((item) => item.user === userId);
  }

  updateUserStatus(userId, newValue) {
    const userStatus = this.getUserStatus(userId);
    if (userStatus) userStatus.value.update(newValue);
  }

  onAddToChannelMessage({ user, browser }) {
    const connectionsInfo = this.p2p
      .addListener(user, !VoiceChannelServer.isBrowserWithFullApi(browser));
    this.sendConnectionsInfo(connectionsInfo);

    this.updateUserStatus(user, {
      voiceChannel: this.id,
      role: VOICE_CHANNEL_USER_ROLES.listener,
    });
  }

  onAddToSpeakersAnswerMessage({ speaker, result, browser }) {
    if (result) {
      const connectionsInfo = this.p2p
        .addSpeaker(speaker, !VoiceChannelServer.isBrowserWithFullApi(browser));
      this.sendConnectionsInfo(connectionsInfo);
    }

    this.updateUserStatus(speaker, {
      voiceChannel: this.id,
      role: result ? VOICE_CHANNEL_USER_ROLES.speaker : VOICE_CHANNEL_USER_ROLES.listener,
    });
  }

  onAddToSpeakersRequestMessage({ user, browser }) {
    if (this.voiceChannel.admins && !this.voiceChannel.admins.includes(user)) {
      this.updateUserStatus(user, {
        voiceChannel: this.id,
        role: VOICE_CHANNEL_USER_ROLES.candidate,
      });
    } else {
      const connectionsInfo = this.p2p
        .addSpeaker(user, !VoiceChannelServer.isBrowserWithFullApi(browser));
      this.sendConnectionsInfo(connectionsInfo);

      this.updateUserStatus(user, {
        voiceChannel: this.id,
        role: VOICE_CHANNEL_USER_ROLES.speaker,
      });
    }
  }

  onRemoveFromSpeakersMessage({ user, browser }) {
    const connectionsInfo = this.p2p.onUserExit(user);
    this.sendConnectionsInfo(connectionsInfo);
    this.onAddToChannelMessage({ user, browser });
  }

  onConnectedMessage({ user }) {
    this.p2p.onUserConnected(user);
  }

  onDisconnectMessage({ user }) {
    const connectionsInfo = this.p2p.onUserExit(user);
    this.sendConnectionsInfo(connectionsInfo);
  }

  onVoiceChannelServiceMessage(messageObject) {
    switch (messageObject.payload.subAction) {
      case VOICE_CHANNEL_SUB_ACTIONS.addToChannel:
        this.onAddToChannelMessage(messageObject); break;
      case VOICE_CHANNEL_SUB_ACTIONS.addToSpeakersRequest:
        this.onAddToSpeakersRequestMessage(messageObject); break;
      case VOICE_CHANNEL_SUB_ACTIONS.addToSpeakersAnswer:
        this.onAddToSpeakersAnswerMessage(messageObject); break;
      case VOICE_CHANNEL_SUB_ACTIONS.removeFromSpeakers:
        this.onRemoveFromSpeakersMessage(messageObject); break;
      case VOICE_CHANNEL_SUB_ACTIONS.connected:
        this.onConnectedMessage(messageObject); break;
      case VOICE_CHANNEL_SUB_ACTIONS.disconnectFromChannel:
        this.onDisconnectMessage(messageObject); break;
    }
  }

  onWebRTCServiceMessage(messageObject) {
    this.virtualServer.broadcastMessage(messageObject);
  }

  onServiceMessage(messageObject) {
    let result = true;
    switch (messageObject.payload.action) {
      case ACTIONS.voiceChannelServiceMessage:
        this.onVoiceChannelServiceMessage(messageObject); break;
      case ACTIONS.webrtcServiceMessage:
        this.onWebRTCServiceMessage(messageObject); break;
      default: result = false;
    }
    return result;
  }

  static isBrowserWithFullApi(browser) {
    return true;
  }

  static isServiceMessage(messageObject) {
    const action = messageObject.payload.action;
    return (action === ACTIONS.voiceChannelServiceMessage)
      || (action === ACTIONS.webrtcServiceMessage);
  }

  sendConnectionsInfo(connections) {
    if (!connections) return;
    const connectionsArray = connections instanceof Array ? connections : [connections];
    connectionsArray.forEach((connectionInfo) => {
      const message = AnswerGeneratorVoiceChannel.fromConnections(connectionInfo);
      this.virtualServer.sendToClient(connections.user, message);
    });
  }
}

module.exports = VoiceChannelServer;
