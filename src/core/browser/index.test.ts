import { afterAll, beforeAll } from '@jest/globals';

describe('Chrome Browser', () => {
  beforeAll(() => {
    const runtime = {
      getURL: jest.fn(),
      sendMessage: jest.fn(),
    };
    Reflect.defineProperty(global, 'chrome', {
      get: () => ({ runtime }),
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(global, 'chrome');
  });

  it('should call getURL', async () => {
    const { getURL } = await import('./index');

    expect(getURL).toBe(chrome.runtime.getURL);
  });

  it('should call sendMessage', async () => {
    const { sendMessage } = await import('./index');

    expect(sendMessage).toBe(chrome.runtime.sendMessage);
  });
});
