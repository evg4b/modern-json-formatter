import '../wasm_exec.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const loadWasm = async () => {
  const go: Go = new Go();

  beforeAll(async () => {
    const wasmBuffer = await readFile(resolve(__dirname, '../parser.wasm'));
    expect(wasmBuffer.length).toBeGreaterThan(0);
    const wasm = await WebAssembly.instantiate(wasmBuffer, go.importObject);
    go.run(wasm.instance);
  });

  afterAll(() => {
    go.exit(0);
  });
};
