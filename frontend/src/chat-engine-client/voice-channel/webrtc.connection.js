import VoiceActivityDetector from "@/chat-engine-client/voice-channel/voice-activity-detector";

export default class WebRTCConnection {
  constructor(contact, p2pClient) {
    this.p2pClient = p2pClient;
    this.contact = contact;

    this.iceQueue = [];

    this.onDisconnected = () => {}; // callback on connection troubles
    this.onInputStream = () => {}; // callback on new input stream
  }

  get webRTCConfig() {
    return this.p2pClient.webRTCConfig;
  }

  get voiceChannel() {
    return this.p2pClient.voiceChannel;
  }

  get voiceChannelInterface() {
    return this.voiceChannel.engineInteface;
  }

  isOnConnectionStateChange() {
    let isActive = true;
    if (this.peerConnection.signalingState) {
      isActive = isActive && (this.peerConnection.signalingState === 'stable');
    }
    if (this.peerConnection.connectionState) {
      isActive = isActive && (this.peerConnection.connectionState === 'connected');
    }
    if (this.isActive !== isActive) this.isActive = isActive;
  }

  createPeerConnection(outputStream) {
    this.peerConnection = new RTCPeerConnection(this.webRTCConfig);
    this.peerConnection.onconnectionstatechange = this.isOnConnectionStateChange.bind(this);
    this.peerConnection.onsignalingstatechange = this.isOnConnectionStateChange.bind(this);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate !== null) {
        this.voiceChannelInterface.sendIce(this.contact, event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (!event.track) return;
      if (!this.inputStream) this.inputStream = new MediaStream();
      this.inputStream.addTrack(event.track);

      // this.voiceDetector.startListeningStream(this.inputStream);
      console.log('input stream ', this.inputStream);
    };

    if (outputStream) outputStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track);
    });
  }

  removeOutputTracks() {
    const senders = this.peerConnection.getSenders();
    senders.forEach((sender) => {
      this.peerConnection.removeTrack(sender);
    });
  }

  updateOutputStream(newStream) {
    if (!newStream) return;
    this.removeOutputTracks();
    newStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track);
    });
  }

  async connectToClient() {
    try {
      const newOffer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(new RTCSessionDescription(newOffer));
      const result = await this.voiceChannelInterface.sendOffer(this.contact, newOffer);
      if (!result.answer) throw new Error('No answer from voice channel client!');
      await this.onAnswer(result.answer);
    } catch (e) {
      this.voiceChannel.onError(e);
    }
  }

  close() {
    this.iceQueue = [];
    // this.voiceChannel.onCloseConnection(this.contact);
    if (this.inputStream) {
      const tracks = this.inputStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.inputStream = undefined;
    }
    this.peerConnection.close();
    this.peerConnection = undefined;
  }

  async onOffer(offer, uniqueMessageId) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    await this.voiceChannelInterface.sendAnswer(this.contact, answer, uniqueMessageId);
  }

  async onAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    if (this.iceQueue.length) {
      let tasksChain = Promise.resolve();
      this.iceQueue.forEach((ice) => {
        tasksChain = tasksChain.then(() => this.onIce(ice, true));
      });

      await tasksChain;
    }
  }

  async onIce(ice, fromQueue = false) {
    if (
      !this.peerConnection
      || !this.peerConnection.remoteDescription
      || !this.peerConnection.remoteDescription.type
    ) {
      if (!fromQueue) this.iceQueue.push(ice);
      return false;
    }
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(ice));
    return true;
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(value) {
    this._isActive = value;
    if (!this._isActive && this.onDisconnected) this.onDisconnected();
  }
}
