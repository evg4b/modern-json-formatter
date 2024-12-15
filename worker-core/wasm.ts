import { getURL } from '@core/browser';
import { loadWasm } from './helpers';

export const importWasm = async (go: Go, wasmFile: string) => {
  const webAssemblyInstance = await loadWasm(getURL(wasmFile), go.importObject);

  void go
    .run(webAssemblyInstance.instance)
    .then(() => console.log(`Wasm module ${ wasmFile } loaded successfully`))
    .catch((error: unknown) => console.error(error))
    .finally(() => console.log('Wasm module loaded'));
};
