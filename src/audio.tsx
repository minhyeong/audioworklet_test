import { Button } from "@mui/material";
import type { NextPage } from "next";
import test_processing from "./test_processing";

const AudioTest: NextPage = () => {
  let audioContext: AudioContext;
  let firstFlag = false;
  const play = async () => {
    if (firstFlag) return;
    firstFlag = true;
    audioContext = new AudioContext({ sampleRate: 16000 });
    audioContext.audioWorklet.addModule("/audio-processor.js");
    await navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream: MediaStream) => {
        const streamNode = audioContext.createMediaStreamSource(stream);
        const audioNode = new AudioWorkletNode(audioContext, "audio-processor");
        streamNode.connect(audioNode).connect(audioContext.destination);
        audioNode.port.onmessage = (event) => {
          const audioData = test_processing(event.data);
          audioNode.port.postMessage({ audio: audioData });
        };
      });
  };

  return <Button onClick={play}>On</Button>;
};

export default AudioTest;
