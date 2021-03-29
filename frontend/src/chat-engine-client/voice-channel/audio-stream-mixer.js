export default class AudioStreamMixer {
  constructor(arrayAudioStreams = []) {
    this.audioContext = new AudioContext();
    this.audioSources = [];

    if (arrayAudioStreams.length) {
      this.createMixedStream(arrayAudioStreams);
    }
  }

  addInputStream(stream) {
    const audioTracks = stream
      .getTracks()
      .filter((track) => track.kind === 'audio');
    if (!audioTracks.length) {
      return;
    }

    const audioSource = this.audioContext.createMediaStreamSource(stream);
    this.audioSources.push(audioSource);

    if (this.audioDestination) {
      audioSource.connect(this.audioDestination);
    }
  }

  createMixedStream(arrayAudioStreams = []) {
    if (!arrayAudioStreams.length) return undefined;
    arrayAudioStreams.forEach((stream) => {
      this.addInputStream(stream);
    });

    return this.resultStream;
  }

  get resultStream() {
    if (!this.audioDestination) {
      if (!this.audioSources.length) return undefined;
      this.audioDestination = this.audioContext.createMediaStreamDestination();
      this.audioSources.forEach((audioSource) => {
        audioSource.connect(this.audioDestination);
      });
    }
    return this.audioDestination.stream;
  }
}
