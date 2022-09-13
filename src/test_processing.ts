const test_processing = (data: Float32Array) => {
  let ret = new Uint8Array(data.length);
  let s = new Uint8Array(1);

  for (let i = 0; i < data.length; i++) {
    s[0] = (data[i] + 1) * 128 - 1;
    ret[i] = s[0];
  }

  console.log(ret);

  return ret;
};

export default test_processing;
