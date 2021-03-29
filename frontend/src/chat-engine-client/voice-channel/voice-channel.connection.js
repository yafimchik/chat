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

      console.log('input stream ', this.inputStream);
      this.voiceChannel.onInputStream(this.contact, this.inputStream);
    };

    outputStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track);
    });
  }

  close() {
    this.iceQueue = [];
    this.voiceDetector.stopListening();
    this.voiceChannel.onCloseConnection(this.contact);
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

}
