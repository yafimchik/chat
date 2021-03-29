import VoiceChannelMessageGenerator
  from '@/chat-engine-client/voice-channel/voice-channel.message-generator';

export default class VoiceChannelInterface {
  constructor(token, sendMessageFn, sendMessageAsyncFn) {
    this.token = token;

    this.sendMessage = sendMessageFn;
    this.sendMessageAsync = sendMessageAsyncFn;

    this.messageGenerator = new VoiceChannelMessageGenerator(token);

    this.onIce = () => {};
    this.onAnswer = () => {};
    this.onOffer = () => {};
  }

  set voiceChannelCallbacks(
    {
      onWebRTCMessageCallback = () => {},
      onConnectInfoMessageCallback = () => {},
    }) {
    this.onWebRTCMessage = onWebRTCMessageCallback;
    this.onConnectInfoMessage = onConnectInfoMessageCallback;
  }

  initialize(virtualServer, voiceChannel) {
    if (virtualServer) this.virtualServer = virtualServer;
    if (voiceChannel) this.voiceChannel = voiceChannel;
  }

  sendStatus(status) {
    const message = this.messageGenerator.status(status);
    this.sendMessage(this.virtualServer, message);
  }

  sendVoiceChannelStatusConnected() {
    const message = this.messageGenerator.connected();
    this.sendMessage(this.virtualServer, message);
  }

  async sendOffer(contact, offer) {
    const message = this.messageGenerator.offer(this.voiceChannel, contact, offer);
    return this.sendMessageAsync(this.virtualServer, message);
  }

  sendAnswer(contact, answer, uniqueMessageId) {
    const message = this.messageGenerator
      .answer(this.voiceChannel, contact, answer, uniqueMessageId);
    return this.sendMessage(this.virtualServer, message);
  }

  sendIce(contact, ice) {
    const message = this.messageGenerator.ice(this.voiceChannel, contact, ice);
    return this.sendMessage(this.virtualServer, message);
  }

  sendCreateP2PConnectionMessage(contact, isOutputConnection) {
    const message = this.messageGenerator
      .CreateP2PConnectionMessage(this.voiceChannel, contact, isOutputConnection);
    return this.sendMessage(this.virtualServer, message);
  }
}
