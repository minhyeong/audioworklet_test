class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audio = [0];
    this.port.onmessage = (event) => {
      this.audio = event.data.audio;
    };
  }

  process(inputs, outputs) {
    const inputData = inputs[0][0];

    if (typeof this.audio !== "undefined") {
      for (let i = 0; i < this.audio.length; i++) {
        outputs[0][0][i] = (this.audio[i] - 128) / 128;
      }
    }

    if (inputData instanceof Float32Array) {
      this.port.postMessage(inputData);
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
