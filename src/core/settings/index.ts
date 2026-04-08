export type DownloadMode = 'dropdown' | 'raw' | 'formatted' | 'minified';

export interface ToolbarButtonsSettings {
  query: boolean;
  formatted: boolean;
  raw: boolean;
  download: boolean;
}

export interface ExtensionSettings {
  buttons: ToolbarButtonsSettings;
  downloadMode: DownloadMode;
  maxFileSize: number;
}

export const MIN_FILE_SIZE_MB = 1;
export const MAX_FILE_SIZE_MB = 150;
export const DEFAULT_MAX_FILE_SIZE_MB = 10;

export const DEFAULT_SETTINGS: ExtensionSettings = {
  buttons: {
    query: true,
    formatted: true,
    raw: true,
    download: true,
  },
  downloadMode: 'dropdown',
  maxFileSize: DEFAULT_MAX_FILE_SIZE_MB,
};

const STORAGE_KEY = 'mjf_settings';

export const getSettings = async (): Promise<ExtensionSettings> => {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  if (!result[STORAGE_KEY]) {
    return DEFAULT_SETTINGS;
  }

  return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };
};

export const saveSettings = async (settings: ExtensionSettings): Promise<void> => {
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
};
