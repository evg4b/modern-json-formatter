import { rstest } from "@rstest/core";

rstest.mock('../worker-core/wasm', () => ({
  importWasm: rstest.fn(() => Promise.resolve()),
}));
