import { rstest } from '@rstest/core';
import { identity } from 'es-toolkit';

rstest.mock('@core/browser', () => ({
  resource: rstest.fn(identity),
  sendMessage: rstest.fn(() => Promise.resolve()),
}));
