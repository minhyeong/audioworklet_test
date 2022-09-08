class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs) {
    const inputData = inputs[0][0];

    /*
    for (let i = 0; i < inputData.length; i++) {
      outputs[0][0][i] = inputData[i];
    }
    */

    if (inputData instanceof Float32Array) {
      this.port.postMessage(inputData);
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
