import { rstest } from '@rstest/core';

rstest.mock('../worker-wasm/pkg', () => ({
  initialize: rstest.fn(),
  jq: rstest.fn(),
  tokenize: rstest.fn(),
  format: rstest.fn(),
  minify: rstest.fn(),
}));
