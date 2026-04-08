import { rstest } from '@rstest/core';
import type { ExtensionSettings } from '@core/settings';

const defaultSettings: ExtensionSettings = {
  buttons: {
    query: true,
    formatted: true,
    raw: true,
    download: true,
  },
  downloadMode: 'dropdown',
  maxFileSize: 3,
};

rstest.mock('@core/settings', () => ({
  DEFAULT_SETTINGS: defaultSettings,
  getSettings: rstest.fn(() => Promise.resolve(defaultSettings)),
  saveSettings: rstest.fn(() => Promise.resolve()),
}));
