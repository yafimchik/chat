import VoiceActivityDetector from '@/chat-engine-client/voice-channel/voice-activity-detector';

export default class VoiceChannelConnection {
  constructor(outputStream, contact, voiceChannel) {
    this.voiceChannel = voiceChannel;
    this.contact = contact;
    this.inputStream = undefined;
    this.iceQueue = [];
    this.createPeerConnection(outputStream, this.voiceChannel.connectionConfig);

    this.voiceDetector = new VoiceActivityDetector({
      onSpeaking: () => {
        this.voiceChannel.onVoiceDetectionEvent({ value: true, contact: this.contact });
      },
      onStoppedSpeaking: () => {
        this.voiceChannel.onVoiceDetectionEvent({ value: false, contact: this.contact });
      },
    });
  }

  createPeerConnection(outputStream, config) {
    this.peerConnection = new RTCPeerConnection(config);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate !== null) {
        this.voiceChannel.sendIce(this.contact, event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (!event.track) return;
      if (!this.inputStream) this.inputStream = new MediaStream();
      this.inputStream.addTrack(event.track);

      this.voiceDetector.startListeningStream(this.inputStream);

      this.voiceChannel.onInputStream(this.contact, this.inputStream);
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
        const result = await this.voiceChannel.sendOffer(this.contact, newOffer);
        if (!result.answer) throw new Error('No answer from voice channel client!');
        await this.onAnswer(result.answer);
      }
    } catch (e) {
      this.voiceChannel.onError(e);
    }
  }

  close() {
    this.voiceDetector.stopListening();
    this.voiceChannel.onCloseConnection();
    this.peerConnection.close();

    if (this.inputStream) {
      const tracks = this.inputStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.inputStream = undefined;
    }
  }

  async onOffer(offer, uniqueMessageId) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.voiceChannel.sendAnswer(this.contact, answer, uniqueMessageId);
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
}
