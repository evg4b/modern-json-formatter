import { expect, test } from './support/fixtures';
import { sample } from './support/samples';
import { ui } from './support/ui';

const SETTINGS_KEY = 'mjf_settings';

test.beforeEach(async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/options.html`);
});

test('renders every settings section', async ({ page }) => {
  await expect(page.getByText('Toolbar Buttons')).toBeVisible();
  await expect(page.getByText('Download Button Mode')).toBeVisible();
  await expect(page.getByText('Maximum File Size')).toBeVisible();
  await expect(page.getByText('Query history data')).toBeVisible();
});

test('matches the options page', { tag: '@screenshot' }, async ({ page }) => {
  await expect(page.getByText('Query history data')).toBeVisible();

  await expect(page).toHaveScreenshot('options.png', { fullPage: true });
});

test('switches the download button to a direct download', async ({ page, open, shadow }) => {
  await page.locator('input[type="radio"][value="minified"]').check();
  await expect
    .poll(() => page.evaluate(key => chrome.storage.sync.get(key), SETTINGS_KEY))
    .toMatchObject({ [SETTINGS_KEY]: { downloadMode: 'minified' } });

  await open(sample);

  const button = await shadow.find(ui.download);
  expect(await button.evaluate<string>('function () { return this.title; }')).toBe('Download Minified');
});

test('records the queries that were run', async ({ page, extensionId, open, shadow }) => {
  await open(sample);
  await (await shadow.find(ui.tab('query'))).click();
  await (await shadow.find(ui.queryInput)).click();
  await page.keyboard.type('.tags');
  await page.keyboard.press('Enter');
  await shadow.find(ui.tree);

  await page.goto(`chrome-extension://${extensionId}/options.html`);

  await expect(page.locator('mjf-table-element tr').filter({ hasText: 'json.test' })).toHaveText(/json\.test\s+1/);
});

test('hides a toolbar button disabled in the settings', async ({ page, open, shadow }) => {
  await page.locator('input[data-key="raw"]').uncheck();
  await expect
    .poll(() => page.evaluate(key => chrome.storage.sync.get(key), SETTINGS_KEY))
    .toMatchObject({ [SETTINGS_KEY]: { buttons: { raw: false } } });

  await open(sample);
  await shadow.find(ui.toolbar);

  expect(await shadow.exists(ui.tab('raw'))).toBe(false);
  expect(await shadow.exists(ui.tab('query'))).toBe(true);
});
