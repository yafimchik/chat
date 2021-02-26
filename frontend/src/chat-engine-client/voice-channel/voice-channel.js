import VoiceChannelConnection from '@/chat-engine-client/voice-channel/voice-channel.connection';
import VoiceActivityDetector from '@/chat-engine-client/voice-channel/voice-activity-detector';
import { ICE_SERVERS } from '@/chat-engine-client/chat-engine.client.constants';

export default class VoiceChannel {
  constructor(
    sendIceCallback = () => {},
    sendOfferCallback = () => {},
    sendAnswerCallback = () => {},
    onInputStreamCallback = () => {},
    onCloseConnectionCallback = () => {},
    onErrorCallback = () => {},
    onVoiceDetectionEventCallback = () => {},
  ) {
    this.connectionConfig = undefined;

    this.sendOffer = sendOfferCallback.bind(undefined, this.virtualServer, this.voiceChannel);
    this.sendIce = sendIceCallback.bind(undefined, this.virtualServer, this.voiceChannel);
    this.sendAnswer = sendAnswerCallback.bind(undefined, this.virtualServer, this.voiceChannel);
    this.onInputStream = onInputStreamCallback;
    this.onCloseConnection = onCloseConnectionCallback;
    this.onError = onErrorCallback;
    this.onVoiceDetectionEvent = onVoiceDetectionEventCallback;

    this.connections = [];
    this.mediaStream = undefined;
    this.microphoneState = true;
  }

  setConnectionConfig(config) {
    if (!config) return;
    this.connectionConfig = { ...config };
  }

  setUser(user) {
    this.user = user;
  }

  get microphoneTrack() {
    if (!this.mediaStream) return undefined;
    const audioTracks = this.mediaStream.getAudioTracks();
    if (!audioTracks && !audioTracks.length) return undefined;
    return audioTracks[0];
  }

  switchMicrophone(value) {
    this.microphoneState = (value !== undefined) ? value : !this.microphoneState;
    if (!this.microphoneTrack) return true;
    this.microphoneTrack.enabled = this.microphoneState;
    return this.microphoneState;
  }

  get microphoneMuted() {
    if (!this.microphoneTrack) return !this.microphoneState;
    return !this.microphoneTrack.enabled;
  }

  createConnection(contact) {
    const connection = new VoiceChannelConnection(this.mediaStream, contact, this);
    this.connections.push(connection);
    return connection;
  }

  async connectToChannel(virtualServer, voiceChannel, contacts = []) {
    this.virtualServer = virtualServer;
    this.voiceChannel = voiceChannel;
    if (!contacts || !contacts.length) return true;

    try {
      await this.createMediaStream();

      contacts.forEach((contact) => {
        this.createConnection(contact);
      });

      await Promise.all(this.connections.map((connection) => connection.connectToClient()));
    } catch (error) {
      this.onError(error);
      return false;
    }
    return true;
  }

  async disconnect() {
    this.connections.forEach((connection) => {
      connection.close();
    });
    this.connections = [];

    if (this.mediaStream) {
      this.voiceDetector.stopListening();

      const tracks = this.mediaStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.mediaStream = undefined;
    }
  }

  onContactDisconnect(contact) {
    const connectionIndex = this.connections
      .findIndex((connection) => connection.contact === contact);
    if (connectionIndex === -1) return;
    const connection = this.connections[connectionIndex];
    connection.close();
    this.connections.splice(connectionIndex, 1);
  }

  async createMediaStream() {
    if (this.mediaStream) return true;

    try {
      this.mediaStream = await navigator.mediaDevices
        .getUserMedia({ video: false, audio: true });
      this.switchMicrophone(this.microphoneState);

      this.voiceDetector = new VoiceActivityDetector({
        onSpeaking: () => {
          this.onVoiceDetectionEvent({ value: true, contact: this.user._id });
        },
        onStoppedSpeaking: () => {
          this.onVoiceDetectionEvent({ value: false, contact: this.user._id });
        },
      });
      this.voiceDetector.startListeningStream(this.mediaStream);
      console.log('output stream ', this.mediaStream);
    } catch (error) {
      this.onError(error);
      this.mediaStream = null;
    }
    return !!this.mediaStream;
  }

  async onOffer(virtualServer, {
    voiceChannel,
    user,
    offer,
    uniqueMessageId,
  }) {
    if (this.virtualServer) {
      this.virtualServer = virtualServer;
      this.voiceChannel = voiceChannel;
    }

    try {
      await this.createMediaStream();
      const connection = this.createConnection(user);
      await connection.connectToClient(offer, uniqueMessageId);
    } catch (error) {
      this.onError(error);
    }
  }

  async onIce({ user, ice }) {
    const connection = this.getConnectionByContact(user);
    try {
      if (connection) await connection.onIce(ice);
    } catch (error) {
      this.onError(error);
    }
  }

  getConnectionByContact(contact) {
    return this.connections.find((connection) => connection.contact === contact);
  }
}
