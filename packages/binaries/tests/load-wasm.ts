import '../wasm_exec.js';
import { readFile } from 'node:fs/promises';

export const loadWasm = async (file: string) => {
  const go: Go = new Go();

  beforeAll(async () => {
    const wasmBuffer = await readFile(file);
    expect(wasmBuffer.length).toBeGreaterThan(0);
    const wasm = await WebAssembly.instantiate(wasmBuffer, go.importObject);
    void go.run(wasm.instance);
  });
};
