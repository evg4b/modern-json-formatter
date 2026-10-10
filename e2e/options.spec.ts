import { type Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { sample } from './support/samples';
import { ui } from './support/ui';

const SETTINGS_KEY = 'mjf_settings';

const storedSettings = (page: Page) => page.evaluate(key => chrome.storage.sync.get(key), SETTINGS_KEY);

const historyRows = (page: Page) => page.locator('mjf-table-element tbody tr');

test.describe('options page', () => {
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

  test('starts from the default settings', async ({ page }) => {
    for (const key of ['query', 'raw', 'download']) {
      await expect(page.locator(`input[data-key="${key}"]`)).toBeChecked();
    }
    await expect(page.locator('input[type="radio"][value="dropdown"]')).toBeChecked();
    await expect(page.locator('mjf-file-size-section .value-label')).toHaveText('10 MB');
  });

  test('links to the project pages', async ({ page }) => {
    const links = [
      ['mjf-github-button', 'https://github.com/evg4b/modern-json-formatter'],
      ['mjf-ko-fi-button', 'https://ko-fi.com/evg4b'],
      ['mjf-chrome-web-store-button', 'https://chromewebstore.google.com/detail/modern-json-formatter/dmofgolehdakghahlgibeaodbahpfkpf'],
    ];

    for (const [button, href] of links) {
      const link = page.locator(`${button} a`);
      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });

  test('restores the saved settings when opened again', async ({ page }) => {
    await page.locator('input[data-key="raw"]').uncheck();
    await page.locator('input[type="radio"][value="formatted"]').check();
    await expect
      .poll(() => storedSettings(page))
      .toMatchObject({ [SETTINGS_KEY]: { buttons: { raw: false }, downloadMode: 'formatted' } });

    await page.reload();

    await expect(page.locator('input[data-key="raw"]')).not.toBeChecked();
    await expect(page.locator('input[data-key="query"]')).toBeChecked();
    await expect(page.locator('input[type="radio"][value="formatted"]')).toBeChecked();
  });

  test('disables the download mode while the download button is hidden', async ({ page }) => {
    const section = page.locator('mjf-download-mode-section');
    await expect(section).not.toHaveAttribute('disabled');

    await page.locator('input[data-key="download"]').uncheck();
    await expect(section).toHaveAttribute('disabled');

    await page.locator('input[data-key="download"]').check();
    await expect(section).not.toHaveAttribute('disabled');
  });

  test('changes the maximum file size', async ({ page }) => {
    const slider = page.locator('mjf-file-size-section input[type="range"]');
    const label = page.locator('mjf-file-size-section .value-label');

    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(label).toHaveText('11 MB');
    await expect.poll(() => storedSettings(page)).toMatchObject({ [SETTINGS_KEY]: { maxFileSize: 11 } });

    await page.keyboard.press('End');
    await expect(label).toHaveText('50 MB');

    await page.keyboard.press('Home');
    await expect(label).toHaveText('1 MB');
    await expect.poll(() => storedSettings(page)).toMatchObject({ [SETTINGS_KEY]: { maxFileSize: 1 } });
  });

  test('shows an empty query history', async ({ page }) => {
    await expect(historyRows(page)).toHaveText(['No rows']);
  });
});

test.describe('settings applied to the page', () => {
  test('switches the download button to a direct download', async ({ page, extensionId, open, shadow }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await page.locator('input[type="radio"][value="minified"]').check();
    await expect
      .poll(() => storedSettings(page))
      .toMatchObject({ [SETTINGS_KEY]: { downloadMode: 'minified' } });

    await open(sample);

    const button = await shadow.find(ui.download);
    expect(await button.evaluate<string>('function () { return this.title; }')).toBe('Download Minified');
  });

  test('hides a toolbar button disabled in the settings', async ({ page, extensionId, open, shadow }) => {
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await page.locator('input[data-key="raw"]').uncheck();
    await expect
      .poll(() => storedSettings(page))
      .toMatchObject({ [SETTINGS_KEY]: { buttons: { raw: false } } });

    await open(sample);
    await shadow.find(ui.toolbar);

    expect(await shadow.exists(ui.tab('raw'))).toBe(false);
    expect(await shadow.exists(ui.tab('query'))).toBe(true);
  });

  test('hides the query tab', async ({ configure, open, shadow }) => {
    await configure({ buttons: { query: false } });
    await open(sample);
    await shadow.find(ui.tab('raw'));

    expect(await shadow.exists(ui.tab('query'))).toBe(false);
    expect(await shadow.exists(ui.tab('formatted'))).toBe(true);
  });

  test('hides the download button', async ({ configure, open, shadow }) => {
    await configure({ buttons: { download: false } });
    await open(sample);
    await shadow.find(ui.tab('raw'));

    expect(await shadow.exists(ui.download)).toBe(false);
  });

  test('drops the tabs when only the formatted view is left', async ({ configure, open, shadow }) => {
    await configure({ buttons: { query: false, raw: false } });
    await open(sample);
    await shadow.find(ui.download);

    expect(await shadow.exists(ui.tab('formatted'))).toBe(false);
    expect(await (await shadow.find(ui.tree)).text()).toContain('"name":"Modern JSON Formatter"');
  });
});

test.describe('query history data', () => {
  test('records the queries that were run', async ({ page, extensionId, open, query, shadow }) => {
    await open(sample);
    await query('.tags');
    await shadow.find(ui.tree);

    await page.goto(`chrome-extension://${extensionId}/options.html`);

    await expect(historyRows(page).filter({ hasText: 'json.test' })).toHaveText(/json\.test\s+1/);
  });

  test('lists the busiest site first', async ({ page, extensionId, open, query, shadow }) => {
    await open(sample, { url: 'https://quiet.test/sample.json' });
    await query('.tags');
    await shadow.find(ui.tree);
    await open(sample);
    for (const expression of ['.tags', '.name']) {
      await query(expression);
      await shadow.find(ui.tree);
    }

    await page.goto(`chrome-extension://${extensionId}/options.html`);

    await expect(historyRows(page)).toHaveText([/json\.test\s+2/, /quiet\.test\s+1/]);
  });

  test('clears the query history', async ({ page, extensionId, open, query, shadow }) => {
    await open(sample);
    await query('.tags');
    await shadow.find(ui.tree);
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await expect(historyRows(page)).toHaveText([/json\.test\s+1/]);

    await page.locator('mjf-rounded-button').filter({ hasText: 'Clear' })
      .click();

    await expect(historyRows(page)).toHaveText(['No rows']);

    await open(sample);
    await (await shadow.find(ui.tab('query'))).click();
    await shadow.find(ui.queryInput);
    expect(await shadow.exists(ui.historyOption)).toBe(false);
  });
});
