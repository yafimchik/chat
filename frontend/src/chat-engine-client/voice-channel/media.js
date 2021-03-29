export default class Media {
  constructor() {
    this.inputStream = undefined;
    this.mutedState = false;
  }

  setInputStream(stream) {
    this.inputStream = stream;
  }

  async setInputFromMediaDevice() {
    try {
      this.inputStream = await navigator.mediaDevices
        .getUserMedia({ video: false, audio: true });
    } catch (error) {
      this.onError(error);
      this.inputStream = null;
    }
  }

  get stream() {
    return this.inputStream;
  }

  closeStream() {
    if (!this.inputStream) return;
    const tracks = this.inputStream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    this.inputStream = undefined;
  }

  get audioTracks() {
    if (!this.inputStream) return [];
    const audioTracks = this.inputStream.getAudioTracks();
    if (!audioTracks && !audioTracks.length) return [];
  }

  get muted() {
    return this.mutedState;
  }

  set muted(value) {
    this.mutedState = value;
    this.audioTracks.forEach((audioTrack) => {
      audioTrack.enabled = !value;
    });
  }

  initTrack(track) {
    track.enabled = !this.muted;
  }

  toggleMutedState() {
    this.muted = !this.muted;
  }

  onError(error) {
    console.error(error);
  }
}
