import { Button } from "@mui/material";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const floatTo16BitPCM = (
    output: DataView,
    offset: number,
    input: Float32Array
  ) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const encodeWAV = (samples: Float32Array, sampleRate: number) => {
    let buffer = new ArrayBuffer(44 + samples.length * 2);
    let view = new DataView(buffer);

    writeString(view, 0, "RIFF"); // RIFFヘッダ
    view.setUint32(4, 32 + samples.length * 2, true); // これ以降のファイルサイズ
    writeString(view, 8, "WAVE"); // WAVEヘッダ
    writeString(view, 12, "fmt "); // fmtチャンク
    view.setUint32(16, 16, true); // fmtチャンクのバイト数
    view.setUint16(20, 1, true); // フォーマットID
    view.setUint16(22, 1, true); // チャンネル数
    view.setUint32(24, sampleRate, true); // サンプリングレート
    view.setUint32(28, sampleRate * 2, true); // データ速度
    view.setUint16(32, 2, true); // ブロックサイズ
    view.setUint16(34, 16, true); // サンプルあたりのビット数
    writeString(view, 36, "data"); // dataチャンク
    view.setUint32(40, samples.length * 2, true); // 波形データのバイト数
    floatTo16BitPCM(view, 44, samples); // 波形データ

    return view;
  };

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

  const start = async () => {
    const audioContext = new AudioContext();
    audioContext.audioWorklet.addModule("/audio-processor.js");

    let buffer: Float32Array[] = new Array();
    await navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .catch((e) => {
        console.error(e);
      })
      .then((stream) => {
        const streamNode = audioContext.createMediaStreamSource(stream);
        const audioNode = new AudioWorkletNode(audioContext, "audio-processor");
        streamNode.connect(audioNode).connect(audioContext.destination);
        audioNode.port.onmessage = (e) => {
          buffer.push(mergeBuffers(e.data));
          if (buffer.length > 50) {
            const dataview: DataView = encodeWAV(mergeBuffers(buffer), 16000);
            const audioBlob = new Blob([dataview], { type: "audio/wav" });
            const myURL = window.URL || window.webkitURL;
            const url = myURL.createObjectURL(audioBlob);
            console.log(url);
            //const audio = new Audio(url);
            //audio.play();
          }
        };
      });
  };

  return (
    <>
      <Button onClick={start}>push</Button>
    </>
  );
};

export default Home;
