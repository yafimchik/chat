export default class VoiceChannelConnection {
  constructor(
    contact,
    connectionConfig,
    sendIceCallback = () => {},
    sendOfferCallback = () => {},
    sendAnswerCallback = () => {},
    onInputStreamCallback = () => {},
    onErrorCallback = () => {},
  ) {
    this.contact = contact;
    this.sendIce = sendIceCallback;
    this.sendOffer = sendOfferCallback;
    this.sendAnswer = sendAnswerCallback;
    this.onInputStream = onInputStreamCallback;
    this.onError = onErrorCallback;

    this.isOnline = false;

    this.stream = undefined;

    this.createPeerConnection(connectionConfig);
  }

  createPeerConnection(outputStream, config) {
    this.peerConnection = new RTCPeerConnection(config);

    this.peerConnection.onicecandidate = (event) => {
      console.log('new ice candidate', event.candidate);
      if (event.candidate !== null) {
        this.sendIce(this.contact, event.candidate);
        // TODO отправляем json и ice пакеты
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (!event.streams[0]) return;
      if (this.stream) return;

      this.onInputStream(this.contact, this.stream); // TODO listening of stream in front

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

  async onOffer(offer, uniqueMessageId) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.sendAnswer(this.contact, answer, uniqueMessageId);
  }

  async onAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    this.isOnline = true;
  }

  async onIce(ice) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(ice));
  }
}
