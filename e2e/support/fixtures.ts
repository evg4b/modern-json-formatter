import { type BrowserContext, chromium, test as base } from '@playwright/test';
import { join } from 'node:path';
import { shadowDom, type ShadowDom } from './shadow';

const extensionPath = join(import.meta.dirname, '..', '..', 'dist');
const pageUrl = 'https://json.test/sample.json';
const queryTimeout = 15_000;

export type OpenPage = (body: string, contentType?: string) => Promise<void>;

export interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  shadow: ShadowDom;
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

    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    await use(new URL(worker.url()).host);
  },

  shadow: async ({ context, page }, use) => {
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await use(shadowDom(page, cdp, queryTimeout));
    await cdp.detach();
  },

  open: async ({ page }, use) => {
    await use(async (body, contentType = 'application/json') => {
      await page.route(pageUrl, route => route.fulfill({ contentType, body }));
      await page.goto(pageUrl);
    });
  },
});

export { expect } from '@playwright/test';
