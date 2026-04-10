import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, rstest, test } from '@rstest/core';

const CONNECTION_ERROR = 'Could not establish connection. Receiving end does not exist.';

describe('Chrome Browser', () => {
  beforeAll(() => {
    const runtime = {
      getURL: rstest.fn(),
      sendMessage: rstest.fn(),
    };
    Reflect.defineProperty(global, 'chrome', {
      get: () => ({ runtime }),
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(global, 'chrome');
  });

  test('should call getURL with the given path', async () => {
    const { resource } = await import('./index');
    (chrome.runtime.getURL as ReturnType<typeof rstest.fn>).mockReturnValue('chrome-extension://abc/icon.png');

    expect(resource('icon.png')).toBe('chrome-extension://abc/icon.png');
    expect(chrome.runtime.getURL).toHaveBeenCalledWith('icon.png');
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      rstest.useFakeTimers();
      (chrome.runtime.sendMessage as ReturnType<typeof rstest.fn>).mockReset();
    });

    afterEach(() => {
      rstest.useRealTimers();
    });

    test('resolves on the first attempt', async () => {
      const { sendMessage } = await import('./index');
      (chrome.runtime.sendMessage as ReturnType<typeof rstest.fn>).mockResolvedValue({ ok: true });

      expect(await sendMessage({ action: 'test' })).toEqual({ ok: true });
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
    });

    test('retries after a connection error and resolves', async () => {
      const { sendMessage } = await import('./index');
      (chrome.runtime.sendMessage as ReturnType<typeof rstest.fn>)
        .mockRejectedValueOnce(new Error(CONNECTION_ERROR))
        .mockResolvedValue({ ok: true });

      const resultPromise = sendMessage({ action: 'test' });
      await rstest.runAllTimersAsync();

      expect(await resultPromise).toEqual({ ok: true });
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(2);
    });

    test('throws after exhausting all retries', async () => {
      const { sendMessage } = await import('./index');
      (chrome.runtime.sendMessage as ReturnType<typeof rstest.fn>)
        .mockRejectedValue(new Error(CONNECTION_ERROR));

      const resultPromise = sendMessage({ action: 'test' });

      /*
       * Register the rejection handler BEFORE advancing timers to prevent
       * the unhandled rejection warning that would otherwise appear when
       * runAllTimersAsync completes and the promise rejects before our assertion runs.
       */
      const assertion = expect(resultPromise).rejects.toThrow(CONNECTION_ERROR);
      await rstest.runAllTimersAsync();
      await assertion;

      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    test('does not retry on non-connection errors', async () => {
      const { sendMessage } = await import('./index');
      (chrome.runtime.sendMessage as ReturnType<typeof rstest.fn>)
        .mockRejectedValue(new Error('Permission denied'));

      await expect(sendMessage({ action: 'test' })).rejects.toThrow('Permission denied');
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
    });
  });
});
