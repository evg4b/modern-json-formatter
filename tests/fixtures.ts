import { chromium, test as base, TestInfo } from '@playwright/test';
import path from 'path';

export const test = base.extend<{ testInfo: TestInfo, expectRequest: (url: string) => void }>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../dist');
    const context = await chromium.launchPersistentContext('', {
      headless: true,
      args: [
        `--disable-extensions-except=${ pathToExtension }`,
        `--load-extension=${ pathToExtension }`,
      ],
    });
    await use(context);
    await context.close();
  },
  // eslint-disable-next-line no-empty-pattern
  testInfo: ({}, use) => use(base.info()),
  expectRequest: ({ page }, use) => use((url: string) => {
    page.on('request', request => {
      if (request.url().includes(url)) {
        test.fail();
      }
    });
  }),
});

export const expect = test.expect;
