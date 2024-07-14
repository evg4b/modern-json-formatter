export const importWasm = async (go: Go, wasmFile: string) => {
  const wasmUrl = chrome.runtime.getURL(wasmFile);

  const webAssemblyInstance = await ('instantiateStreaming' in WebAssembly
    ? WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject)
    : fetch(wasmUrl).then(resp => resp.arrayBuffer())
      .then(bytes => WebAssembly.instantiate(bytes, go.importObject)));

  void go.run(webAssemblyInstance.instance)
    .then(() => console.log(`Wasm module ${ wasmFile } loaded successfully`))
    .catch(console.error)
    .finally(() => console.log('Wasm module loaded'));
};
