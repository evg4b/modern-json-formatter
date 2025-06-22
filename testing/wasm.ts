jest.mock('../worker-core/wasm', () => ({
  importWasm: jest.fn(() => Promise.resolve()),
}));
