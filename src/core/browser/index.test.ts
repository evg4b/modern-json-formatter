import { afterAll, beforeAll, describe, expect, rstest, test } from '@rstest/core';

describe('Chrome Browser', () => {
  beforeAll(() => {
    const runtime = {
      resource: rstest.fn(),
      sendMessage: rstest.fn(),
    };
    Reflect.defineProperty(global, 'chrome', {
      get: () => ({ runtime }),
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(global, 'chrome');
  });

  test('should call resource', async () => {
    const { resource } = await import('./index');

    expect(resource).toBe(chrome.runtime.getURL);
  });

  test('should call sendMessage', async () => {
    const { sendMessage } = await import('./index');

    expect(sendMessage).toBe(chrome.runtime.sendMessage);
  });
});
