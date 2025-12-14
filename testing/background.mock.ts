import { rstest } from "@rstest/core";

rstest.mock('@core/background', () => ({
  format: rstest.fn(),
  jq: rstest.fn(),
  tokenize: rstest.fn(),
  getHistory: rstest.fn(),
  clearHistory: rstest.fn(),
  pushHistory: rstest.fn(),
  getDomains: rstest.fn(),
}));
