import { afterAll, beforeAll, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { DEFAULT_SETTINGS, getSettings, saveSettings } from './index';

const STORAGE_KEY = 'mjf_settings';

describe('settings', () => {
  let storedData: Record<string, unknown> = {};

  beforeAll(() => {
    const storage = {
      get: rstest.fn((key: string) => Promise.resolve({ [key]: storedData[key] })),
      set: rstest.fn((data: Record<string, unknown>) => {
        Object.assign(storedData, data);
        return Promise.resolve();
      }),
    };
    Reflect.defineProperty(global, 'chrome', {
      configurable: true,
      get: () => ({ storage: { sync: storage } }),
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(global, 'chrome');
  });

  beforeEach(() => {
    storedData = {};
    (chrome.storage.sync.get as ReturnType<typeof rstest.fn>).mockClear();
    (chrome.storage.sync.set as ReturnType<typeof rstest.fn>).mockClear();
  });

  describe('DEFAULT_SETTINGS', () => {
    test('has all buttons enabled', () => {
      expect(DEFAULT_SETTINGS.buttons).toEqual({
        query: true,
        formatted: true,
        raw: true,
        download: true,
      });
    });

    test('has downloadMode set to dropdown', () => {
      expect(DEFAULT_SETTINGS.downloadMode).toBe('dropdown');
    });
  });

  describe('getSettings', () => {
    test('returns DEFAULT_SETTINGS when nothing is stored', async () => {
      const result = await getSettings();
      expect(result).toEqual(DEFAULT_SETTINGS);
    });

    test('returns stored settings when present', async () => {
      const stored = {
        buttons: { query: false, formatted: true, raw: false, download: true },
        downloadMode: 'raw' as const,
      };
      storedData[STORAGE_KEY] = stored;

      const result = await getSettings();
      expect(result).toEqual({ ...DEFAULT_SETTINGS, ...stored });
    });

    test('merges partial stored settings with defaults', async () => {
      storedData[STORAGE_KEY] = { downloadMode: 'formatted' };

      const result = await getSettings();
      expect(result.downloadMode).toBe('formatted');
      expect(result.buttons).toEqual(DEFAULT_SETTINGS.buttons);
    });

    test('calls chrome.storage.sync.get with the correct key', async () => {
      await getSettings();
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe('saveSettings', () => {
    test('calls chrome.storage.sync.set with the correct key and value', async () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        downloadMode: 'minified' as const,
      };

      await saveSettings(settings);

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ [STORAGE_KEY]: settings });
    });

    test('persists settings so getSettings returns them', async () => {
      const settings = {
        buttons: { query: false, formatted: true, raw: true, download: false },
        downloadMode: 'formatted' as const,
      };

      await saveSettings(settings);
      const result = await getSettings();

      expect(result).toEqual({ ...DEFAULT_SETTINGS, ...settings });
    });
  });
});
