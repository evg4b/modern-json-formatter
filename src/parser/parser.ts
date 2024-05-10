import '../../parser/wasm_exec.js';

export const initParser = async () => {
  const go = new Go();
  const wasm = await fetch(chrome.runtime.getURL('parser.wasm'));
  await WebAssembly.instantiateStreaming(wasm, go.importObject)
    .then((result) => void go.run(result.instance));
};
