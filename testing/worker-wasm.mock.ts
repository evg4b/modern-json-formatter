import { rstest } from '@rstest/core';

rstest.mock('@wasm', () => ({
  initialize: rstest.fn(),
  jq: rstest.fn(),
  tokenize: rstest.fn(),
  format: rstest.fn(),
  minify: rstest.fn(),
}));
