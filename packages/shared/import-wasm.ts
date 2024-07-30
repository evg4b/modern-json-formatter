import { loadWasm } from './wasm_helpers';

export const importWasm = async (go: Go, wasmFile: string) => {
  const webAssemblyInstance = await loadWasm(chrome.runtime.getURL(wasmFile), go.importObject);

  void go.run(webAssemblyInstance.instance)
    .then(() => console.log(`Wasm module ${ wasmFile } loaded successfully`))
    .catch(console.error)
    .finally(() => console.log('Wasm module loaded'));
};

