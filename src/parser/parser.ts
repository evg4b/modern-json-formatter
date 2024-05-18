import '../../parser/wasm_exec.js';

const loadWasm = async (go: Go) => {
  const wasmUrl = chrome.runtime.getURL('parser.wasm');
  return 'instantiateStreaming' in WebAssembly
    ? WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject)
    : fetch(wasmUrl).then(resp => resp.arrayBuffer())
      .then(bytes => WebAssembly.instantiate(bytes, go.importObject));
};

export const initParser = async () => {
  const go = new Go();
  await loadWasm(go).then((result) => void go.run(result.instance));
};
