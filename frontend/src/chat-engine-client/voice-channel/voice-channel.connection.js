export default class VoiceChannelConnection {
  constructor(
    outputStream,
    contact,
    connectionConfig,
    sendIceCallback = () => {},
    sendOfferCallback = () => {},
    sendAnswerCallback = () => {},
    onInputStreamCallback = () => {},
    onCloseConnectionCallback = () => {},
    onErrorCallback = () => {},
  ) {
    this.contact = contact;
    this.sendIce = sendIceCallback;
    this.sendOffer = sendOfferCallback;
    this.sendAnswer = sendAnswerCallback;
    this.onInputStream = onInputStreamCallback;
    this.onCloseConnection = onCloseConnectionCallback;
    this.onError = onErrorCallback;

    this.isOnline = false;

    this.stream = undefined;
    this.iceQueue = [];

    this.createPeerConnection(outputStream, connectionConfig);
  }

  createPeerConnection(outputStream, config) {
    this.peerConnection = new RTCPeerConnection(config);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate !== null) {
        this.sendIce(this.contact, event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (!this.stream) this.stream = new MediaStream();
      if (!event.track) return;
      this.stream.addTrack(event.track);

      this.onInputStream(this.contact, this.stream);

      // document.getElementById("received_video").srcObject = event.streams[0];
      // // document.getElementById("hangup-button").disabled = false;
      // console.log('not track is added');
    };

    outputStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track);
    });
  }

  async connectToClient(offer, uniqueMessageId) {
    try {
      if (offer) {
        await this.onOffer(offer, uniqueMessageId);
      } else {
        const newOffer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(newOffer);
        const result = await this.sendOffer(this.contact, newOffer);
        if (!result.answer) throw new Error('No answer from voice channel client!');
        await this.onAnswer(result.answer);
      }
    } catch (e) {
      console.error(e);
      this.onError(e);
    }
  }

  close() {
    this.onCloseConnection();
    this.peerConnection.close();

    const tracks = this.stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    this.stream = undefined;
    this.isOnline = false;
  }

  async onOffer(offer, uniqueMessageId) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.sendAnswer(this.contact, answer, uniqueMessageId);
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
    this.isOnline = true;
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
}