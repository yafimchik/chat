import hark from 'hark';

export default class VoiceActivityDetector {
  constructor({ options = {}, onSpeaking = () => {}, onStoppedSpeaking = () => {} }) {
    this.voiceActivityDetector = hark;
    this.eventEmitter = undefined;
    this.onSpeaking = onSpeaking;
    this.onStoppedSpeaking = onStoppedSpeaking;
    this.options = options;
  }

  startListeningStream(stream, options = this.options) {
    if (this.isListening) return;
    if (!stream) return;
    this.eventEmitter = this.voiceActivityDetector(stream, options);

    this.eventEmitter.on('speaking', this.onSpeaking);
    this.eventEmitter.on('stopped_speaking', this.onStoppedSpeaking);
  }

  stopListening() {
    if (!this.isListening) return;
    this.eventEmitter.stop();
    this.eventEmitter = undefined;
  }

  get isListening() {
    return !!this.eventEmitter;
  }
}
