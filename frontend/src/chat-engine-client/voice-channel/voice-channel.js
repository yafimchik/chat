import VoiceChannelConnection from "@/chat-engine-client/voice-channel/voice-channel.connection";

const { ICE_SERVER_URLS } = require('@/chat-engine-client/chat-engine.client.constants');

export default class VoiceChannel {
  constructor(
    connectionConfig = {
      iceServers: [
        {
          urls: ICE_SERVER_URLS,
        }
      ]},
    sendOfferCallback = () => {},
    sendIceCallback = () => {},
    sendAnswerCallback = () => {},
    onInputStreamCallback = () => {},
    onErrorCallback = () => {},
  ) {
    this.connectionConfig = connectionConfig;

    this.sendOffer = sendOfferCallback;
    this.sendIce = sendIceCallback;
    this.sendAnswer = sendAnswerCallback;
    this.onInputStream = onInputStreamCallback;
    this.onError = onErrorCallback;

    this.connections = [];
    this.mediaStream = undefined;
  }

  async connectToChannel(contacts = []) {
    if (!contacts || !contacts.length) return false;

    try {
      await this.createMediaStream();

      contacts.forEach((contact) => {
        this.connections.push(new VoiceChannelConnection(
          contact,
          this.connectionConfig,
          this.sendIce,
          this.sendOffer,
          this.sendAnswer,
          this.onInputStream,
        ));
      });

      await Promise.all(this.connections.map((connection) => connection.connectToClient()));
    } catch (error) {
      console.error(error);
      this.onError(error);
    }
  }

  async createMediaStream() {
    if (this.mediaStream) return true;

    const getUserMediaFunction = navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia;

    try {
      this.mediaStream = await getUserMediaFunction({ video: true, audio:true });
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

  async disconnect() {}

  async onOffer(contact, offer) {
    try {
      await this.createMediaStream();

      const connection = new VoiceChannelConnection(
        contact,
        this.connectionConfig,
        this.sendIce,
        this.sendOffer,
        this.sendAnswer,
        this.onInputStream,
      );
      await connection.connectToClient(offer);
      this.connections.push(connection);
    } catch (error) {
      console.error(error);
      this.onError(error);
    }
  }

  async onIce(contact, ice) {
    const connection = this.getConnectionByContact(contact);
    try {
      if (connection) await connection.onIce(ice);
    } catch (error) {
      console.error(error);
      this.onError(error);
    }
  }

  getConnectionByContact(contact) {
    return this.connections.find((connection) => connection.contact = contact);
  }
}

// // функция помощник
// function endCall() {
//   var videos = document.getElementsByTagName('video');
//   for (var i = 0; i < videos.length; i++) {
//     videos[i].pause();
//   }
//
//   pc.close();
// }
//
// function error(err) {
//   endCall();
// }
// }
