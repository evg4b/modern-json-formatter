import type { Worker } from '@playwright/test';

const DATA_URL_PREFIX = 'data:text/json;charset=utf-8,';

export interface Download {
  filename: string;
  content: string;
}

type Recorder = typeof globalThis & { recordedDownloads: chrome.downloads.DownloadOptions[] };

export const recordDownloads = (worker: Worker): Promise<void> => worker.evaluate(() => {
  const recorder = globalThis as Recorder;
  const download = chrome.downloads.download.bind(chrome.downloads);

  recorder.recordedDownloads = [];
  chrome.downloads.download = (options: chrome.downloads.DownloadOptions) => {
    recorder.recordedDownloads.push(options);

    return download(options);
  };
});

export const recordedDownloads = async (worker: Worker): Promise<Download[]> => {
  const options = await worker.evaluate(() => (globalThis as Recorder).recordedDownloads);

  return options.map(({ filename = '', url }) => ({
    filename,
    content: decodeURIComponent(url.slice(DATA_URL_PREFIX.length)),
  }));
};

export const settleDownloads = async (worker: Worker): Promise<void> => {
  const pending = () => worker.evaluate(async () => {
    const items = await chrome.downloads.search({ state: 'in_progress' });

    return items.length;
  });

  while (await pending() > 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
