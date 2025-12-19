import { rstest } from '@rstest/core';

rstest.mock('@worker-core', () => ({
  initialize: rstest.fn(),
  jq: rstest.fn(),
  tokenize: rstest.fn(),
  format: rstest.fn(),
}));
