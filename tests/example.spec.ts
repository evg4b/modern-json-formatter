import { expect, test } from './fixtures';

test('open extinction', async ({ page, testInfo, expectRequest }) => {
  await page.route('https://text.dev/api', route => route.fulfill({
    json: [{ name: 'Strawberry', id: 21 }],
  }));

  expectRequest('jq.wasm');

  await page.goto('https://text.dev/api');

  expect(page.getByText('Strawberry')).toBeDefined();

  await testInfo.attach('screenshot', {
    body: await page.screenshot(),
    contentType: 'image/ png',
  });

  await page.waitForLoadState('networkidle');
});

test('s extinction', async ({ page }) => {
  await page.route('https://text.dev/api', route => route.fulfill({
    body: 'Hello, world!',
    contentType: 'text/plain',
  }));

  await page.goto('https://text.dev/api');

  page.on('request', request => {
    const url = request.url();
    if (url.includes('jq.wasm') || url.includes('tokenizer.wasm')) {
      test.fail();
    }
  });

  await page.waitForLoadState('networkidle');
});
