import Mp3Encoder from './mp3-encoder';
import WavEncoder from './wav-encoder';
import { convertTimeMMSS } from './utils';

export default class {
  constructor(options = {}) {
    this.micFailed = options.micFailed;
    this.format = options.format ? options.format : 'mp3';
    this.encoderOptions = {
      bitRate: options.bitRate ? options.bitRate : 128,
      sampleRate: options.sampleRate ? options.sampleRate : 44100,
    };

    this.bufferSize = 4096;
    this.record = null;

    this.isPause = false;
    this.isRecording = false;

    this.duration = 0;
    this.volume = 0;

    this.wavSamples = [];

    this._duration = 0;
  }

  start() {
    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: false,
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(this._micCaptured.bind(this))
      .catch(this._micError.bind(this));

    this.isPause = false;
    this.isRecording = true;

    if (this._isMp3() && !this.lameEncoder) {
      this.lameEncoder = new Mp3Encoder(this.encoderOptions);
    }
  }

  _setStateStopped() {
    this._duration = 0;
    this.duration = 0;

    this.isPause = false;
    this.isRecording = false;
  }

  stop() {
    if (!this.stream) {
      this._setStateStopped();
      return;
    }
    this.stream.getTracks().forEach((track) => track.stop());
    this.input.disconnect();
    this.processor.disconnect();
    this.context.close();

    let record = null;

    if (this._isMp3()) {
      record = this.lameEncoder.finish();
    } else {
      const wavEncoder = new WavEncoder({
        bufferSize: this.bufferSize,
        sampleRate: this.encoderOptions.sampleRate,
        samples: this.wavSamples,
      });
      record = wavEncoder.finish();
      this.wavSamples = [];
    }

    record.duration = convertTimeMMSS(this.duration);
    this.record = record;

    this._setStateStopped();
  }

  pause() {
    if (!this.stream) {
      this._setStateStopped();
      return;
    }
    this.stream.getTracks().forEach((track) => track.stop());
    this.input.disconnect();
    this.processor.disconnect();

    this._duration = this.duration;
    this.isPause = true;
  }

  _micCaptured(stream) {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.duration = this._duration;
    this.input = this.context.createMediaStreamSource(stream);
    this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1);
    this.stream = stream;

    this.processor.onaudioprocess = (ev) => {
      const sample = ev.inputBuffer.getChannelData(0);
      let sum = 0.0;

      if (this._isMp3()) {
        this.lameEncoder.encode(sample);
      } else {
        this.wavSamples.push(new Float32Array(sample));
      }

      for (let i = 0; i < sample.length; i += 1) {
        sum += sample[i] * sample[i];
      }

      const currentTime = parseFloat(this.context.currentTime.toFixed(2));
      this.duration = parseFloat(this._duration) + currentTime;
      this.volume = Math.sqrt(sum / sample.length).toFixed(2);
    };

    this.input.connect(this.processor);
    this.processor.connect(this.context.destination);
  }

  _micError(error) {
    this.isPause = false;
    this.isRecording = false;
    this.record = undefined;
    console.debug('mic failed!');
    if (this.micFailed) this.micFailed(error);
  }

  _isMp3() {
    return this.format.toLowerCase() === 'mp3';
  }
}
