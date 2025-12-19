import { rstest } from '@rstest/core';

rstest.mock('@core/browser', () => ({
  resource: rstest.fn((s: string) => s),
  sendMessage: rstest.fn(() => Promise.resolve()),
}));
