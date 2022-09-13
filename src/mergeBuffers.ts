const mergeBuffers = (audioData: Float32Array[]) => {
  let sampleLength = 0;
  for (let i = 0; i < audioData.length; i++) {
    sampleLength += audioData[i].length;
  }
  let samples = new Float32Array(sampleLength);
  let sampleIdx = 0;
  for (let i = 0; i < audioData.length; i++) {
    for (let j = 0; j < audioData[i].length; j++) {
      samples[sampleIdx] = audioData[i][j];
      sampleIdx++;
    }
  }
  return samples;
};

export default mergeBuffers;
