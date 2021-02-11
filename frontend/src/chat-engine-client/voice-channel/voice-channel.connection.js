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

    this.peerConnection.ontrack = function(event) {
      if (!event.streams[0]) return;
      if (this.stream) return;

      this.onInputStream(this.contact, this.stream); // TODO listening of stream in front

      // document.getElementById("received_video").srcObject = event.streams[0];
      // // document.getElementById("hangup-button").disabled = false;
      // console.log('not track is added');
    };

    for (const track of outputStream.getTracks()) {
      this.peerConnection.addTrack(track);
    }
  }

  async connectToClient(offer) {
    try {
      if (offer) {
        await this.onOffer(offer)
      } else {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        const result = await this.sendOffer(this.contact, offer); // TODO отправляем наш offer на сокет
        if (!result.answer) throw new Error('No answer from voice channel client!');
        await this.onAnswer(result.answer);
      }
    } catch (e) {
      console.error(e);
      this.onError(e);
    }
  }

  async onOffer(offer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.sendAnswer(this.contact, answer); // TODO отправляем наш answer на сокет
  }

  async onAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    this.isOnline = true;
  }

  async onIce(ice) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(ice));
  }
}
