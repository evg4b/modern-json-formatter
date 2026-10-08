import { type BrowserContext, type CDPSession, chromium, test as base } from '@playwright/test';
import { join } from 'node:path';
import { type CopyAll, type CopySelection, copySelection, selectAllAndCopy } from './selection';
import { shadowDom, type ShadowDom } from './shadow';

const extensionPath = join(import.meta.dirname, '..', '..', 'dist');
const pageUrl = 'https://json.test/sample.json';
const queryTimeout = 15_000;

export type OpenPage = (body: string, contentType?: string) => Promise<void>;

export interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  cdp: CDPSession;
  shadow: ShadowDom;
  copyAll: CopyAll;
  copySelection: CopySelection;
  open: OpenPage;
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

  extensionId: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
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
    await use(async (body, contentType = 'application/json') => {
      await page.route(pageUrl, route => route.fulfill({ contentType, body }));
      await page.goto(pageUrl);
    });
  },
});

export { expect } from '@playwright/test';
