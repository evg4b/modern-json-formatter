import { type BrowserContext, type CDPSession, chromium, test as base, type Worker } from '@playwright/test';
import { join } from 'node:path';
import type { DownloadMode, ToolbarButtonsSettings } from '@core/settings';
import { type Download, recordDownloads, recordedDownloads, settleDownloads } from './downloads';
import { type CopyAll, type CopySelection, copySelection, selectAllAndCopy } from './selection';
import { shadowDom, type ShadowDom } from './shadow';
import { ui } from './ui';

const extensionPath = join(import.meta.dirname, '..', '..', 'dist');
export const pageUrl = 'https://json.test/sample.json';
const queryTimeout = 15_000;
const SETTINGS_KEY = 'mjf_settings';

export interface OpenOptions {
  contentType?: string;
  url?: string;
}

export interface Settings {
  buttons?: Partial<ToolbarButtonsSettings>;
  downloadMode?: DownloadMode;
  maxFileSize?: number;
}

export type OpenPage = (body: string, options?: OpenOptions) => Promise<void>;
export type Configure = (settings: Settings) => Promise<void>;
export type RunQuery = (expression: string) => Promise<void>;
export type Downloads = () => Promise<Download[]>;

export interface ExtensionFixtures {
  context: BrowserContext;
  worker: Worker;
  extensionId: string;
  cdp: CDPSession;
  shadow: ShadowDom;
  copyAll: CopyAll;
  copySelection: CopySelection;
  open: OpenPage;
  configure: Configure;
  query: RunQuery;
  downloads: Downloads;
}

export const test = base.extend<ExtensionFixtures>({
  context: async ({ viewport, colorScheme }, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      viewport,
      colorScheme,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--force-color-profile=srgb',
        '--disable-lcd-text',
      ],
    });

    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(pageUrl).origin });
    await use(context);
    await context.close();
  },

  worker: async ({ context }, use) => {
    await use(context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker'));
  },

  extensionId: async ({ worker }, use) => {
    await use(new URL(worker.url()).host);
  },

  cdp: async ({ context, page }, use) => {
    const session = await context.newCDPSession(page);
    await session.send('DOM.enable');
    await use(session);
    await session.detach();
  },

  shadow: async ({ cdp, page }, use) => {
    await use(shadowDom(page, cdp, queryTimeout));
  },

  copyAll: async ({ cdp, page, shadow }, use) => {
    await use(async anchor => {
      await (await shadow.find(anchor)).click();

      return selectAllAndCopy(page, cdp, queryTimeout);
    });
  },

  copySelection: async ({ cdp, page }, use) => {
    await use(() => copySelection(page, cdp, queryTimeout));
  },

  open: async ({ page }, use) => {
    await use(async (body, { contentType = 'application/json', url = pageUrl } = {}) => {
      await page.route(url, route => route.fulfill({ contentType, body }));
      await page.goto(url);
    });
  },

  configure: async ({ worker }, use) => {
    await use(async ({ buttons, ...settings }) => {
      const stored = {
        buttons: { query: true, formatted: true, raw: true, download: true, ...buttons },
        ...settings,
      };

      await worker.evaluate(([key, value]) => chrome.storage.sync.set({ [key]: value }), [SETTINGS_KEY, stored] as const);
    });
  },

  query: async ({ page, shadow }, use) => {
    await use(async expression => {
      await (await shadow.find(ui.tab('query'))).click();
      await (await shadow.find(ui.queryInput)).click();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.press('Delete');
      await page.keyboard.type(expression);
      await page.keyboard.press('Enter');
    });
  },

  downloads: async ({ worker }, use) => {
    await recordDownloads(worker);
    await use(() => recordedDownloads(worker));
    await settleDownloads(worker);
  },
});

export { expect } from '@playwright/test';
