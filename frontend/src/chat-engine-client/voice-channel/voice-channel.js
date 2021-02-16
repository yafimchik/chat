import VoiceChannelConnection from '@/chat-engine-client/voice-channel/voice-channel.connection';

const { ICE_SERVER_URLS } = require('@/chat-engine-client/chat-engine.client.constants');

export default class VoiceChannel {
  constructor(
    connectionConfig = {
      iceServers: [
        {
          urls: ICE_SERVER_URLS,
        },
      ],
    },
    sendIceCallback = () => {},
    sendOfferCallback = () => {},
    sendAnswerCallback = () => {},
    onInputStreamCallback = () => {},
    onCloseConnectionCallback = () => {},
    onErrorCallback = () => {},
  ) {
    this.connectionConfig = connectionConfig;

    this.sendOffer = sendOfferCallback;
    this.sendIce = sendIceCallback;
    this.sendAnswer = sendAnswerCallback;
    this.onInputStream = onInputStreamCallback;
    this.onCloseConnection = onCloseConnectionCallback;
    this.onError = onErrorCallback;

    this.connections = [];
    this.mediaStream = undefined;
  }

  async connectToChannel(virtualServer, voiceChannel, contacts = []) {
    this.virtualServer = virtualServer;
    this.voiceChannel = voiceChannel;

    if (!contacts || !contacts.length) return true;

    try {
      await this.createMediaStream();

      contacts.forEach((contact) => {
        this.connections.push(new VoiceChannelConnection(
          this.mediaStream,
          contact,
          this.connectionConfig,
          this.sendIce.bind(undefined, this.virtualServer, this.voiceChannel),
          this.sendOffer.bind(undefined, this.virtualServer, this.voiceChannel),
          this.sendAnswer.bind(undefined, this.virtualServer, this.voiceChannel),
          this.onInputStream,
          this.onCloseConnection,
        ));
      });

      await Promise.all(this.connections.map((connection) => connection.connectToClient()));
    } catch (error) {
      console.error(error);
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
      this.mediaStream = await new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia(
          { video: false, audio: true },
          (stream) => {
            resolve(stream);
          },
          (error) => {
            reject(error);
          },
        );
      });

      // TODO let see us on screen
      // var my_video = document.getElementById('my')
      // my_video.srcObject = stream
    } catch (error) {
      console.error(error);
      this.onError(error);
      this.mediaStream = null;
    }
    return !!this.mediaStream;
  }

  async onOffer(
    virtualServer,
    {
      voiceChannel,
      user,
      offer,
      uniqueMessageId,
    },
  ) {
    if (this.virtualServer) {
      this.virtualServer = virtualServer;
      this.voiceChannel = voiceChannel;
    }

    try {
      await this.createMediaStream();

      const connection = new VoiceChannelConnection(
        this.mediaStream,
        user,
        this.connectionConfig,
        this.sendIce.bind(undefined, this.virtualServer, this.voiceChannel),
        this.sendOffer.bind(undefined, this.virtualServer, this.voiceChannel),
        this.sendAnswer.bind(undefined, this.virtualServer, this.voiceChannel),
        this.onInputStream,
      );
      await connection.connectToClient(offer, uniqueMessageId);
      this.connections.push(connection);
    } catch (error) {
      console.error(error);
      this.onError(error);
    }
  }

  async onIce({ user, ice }) {
    const connection = this.getConnectionByContact(user);
    try {
      if (connection) await connection.onIce(ice);
    } catch (error) {
      console.error(error);
      this.onError(error);
    }
  }

  getConnectionByContact(contact) {
    return this.connections.find((connection) => connection.contact === contact);
  }
}
