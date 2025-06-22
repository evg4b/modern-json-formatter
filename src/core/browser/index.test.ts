import { afterAll, beforeAll } from '@jest/globals';

describe('Chrome Browser', () => {
  beforeAll(() => {
    const runtime = {
      resource: jest.fn(),
      sendMessage: jest.fn(),
    };
    Reflect.defineProperty(global, 'chrome', {
      get: () => ({ runtime }),
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(global, 'chrome');
  });

  it('should call resource', async () => {
    const { resource } = await import('./index');

    expect(resource).toBe(chrome.runtime.getURL);
  });

  it('should call sendMessage', async () => {
    const { sendMessage } = await import('./index');

    expect(sendMessage).toBe(chrome.runtime.sendMessage);
  });
});
