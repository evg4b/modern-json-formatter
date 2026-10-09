import type { DownloadType } from '@core/background/protocol';
import { expect, test } from './support/fixtures';
import { type ShadowDom } from './support/shadow';
import { invalid, sample, sampleFormatted, sampleMinified } from './support/samples';
import { ui } from './support/ui';

const isMenuOpen = async (shadow: ShadowDom) => {
  const menu = await shadow.find(ui.downloadMenu);

  return menu.evaluate<boolean>('function () { return this.matches(":popover-open"); }');
};

const expected: Record<DownloadType, { filename: string; content: string }> = {
  raw: { filename: 'sample.json', content: sample },
  formatted: { filename: 'sample_formatted.json', content: sampleFormatted },
  minified: { filename: 'sample_minified.json', content: sampleMinified },
};

const types = Object.keys(expected) as DownloadType[];

test.describe('download menu', () => {
  test.beforeEach(async ({ open, shadow }) => {
    await open(sample);
    await shadow.find(ui.tree);
  });

  test('lists every download format', async ({ shadow }) => {
    await (await shadow.find(ui.download)).click();

    for (const [type, label] of [['raw', 'Raw'], ['formatted', 'Formatted'], ['minified', 'Minified']] as const) {
      expect((await (await shadow.find(ui.downloadOption(type))).text()).trim()).toBe(label);
    }
  });

  for (const type of types) {
    test(`downloads the ${type} document`, async ({ downloads, shadow }) => {
      await (await shadow.find(ui.download)).click();
      await (await shadow.find(ui.downloadOption(type))).click();

      await expect.poll(downloads).toEqual([expected[type]]);
    });
  }

  test('closes the menu once a format is chosen', async ({ downloads, shadow }) => {
    await (await shadow.find(ui.download)).click();
    await expect.poll(() => isMenuOpen(shadow)).toBe(true);

    await (await shadow.find(ui.downloadOption('raw'))).click();

    await expect.poll(() => isMenuOpen(shadow)).toBe(false);
    await expect.poll(async () => (await downloads()).length).toBe(1);
  });

  test('closes the menu on escape without downloading', async ({ downloads, page, shadow }) => {
    await (await shadow.find(ui.download)).click();
    await expect.poll(() => isMenuOpen(shadow)).toBe(true);

    await page.keyboard.press('Escape');

    await expect.poll(() => isMenuOpen(shadow)).toBe(false);
    expect(await downloads()).toEqual([]);
  });

  test('closes the menu on a click outside of it', async ({ page, shadow }) => {
    await (await shadow.find(ui.download)).click();
    await expect.poll(() => isMenuOpen(shadow)).toBe(true);

    await page.mouse.click(10, 700);

    await expect.poll(() => isMenuOpen(shadow)).toBe(false);
  });
});

test.describe('direct download', () => {
  for (const type of types) {
    test(`downloads the ${type} document in one click`, async ({ configure, downloads, open, shadow }) => {
      await configure({ downloadMode: type });
      await open(sample);

      await (await shadow.find(ui.download)).click();

      await expect.poll(downloads).toEqual([expected[type]]);
      expect(await shadow.exists(ui.downloadMenu)).toBe(false);
    });
  }
});

test.describe('file names', () => {
  const urls = [
    { url: 'https://json.test/api/users.v2.json', filename: 'users_minified.json' },
    { url: 'https://json.test/api/users', filename: 'users_minified.json' },
    { url: 'https://json.test/data.json?page=2', filename: 'data_minified.json' },
    { url: 'https://api.json.test/', filename: 'api-json-test_minified.json' },
  ];

  for (const { url, filename } of urls) {
    test(`names the file after ${url}`, async ({ configure, downloads, open, shadow }) => {
      await configure({ downloadMode: 'minified' });
      await open(sample, { url });

      await (await shadow.find(ui.download)).click();

      await expect.poll(async () => (await downloads()).map(download => download.filename)).toEqual([filename]);
    });
  }
});

test.describe('invalid document', () => {
  test.beforeEach(async ({ open, shadow }) => {
    await open(invalid);
    await shadow.find(ui.errorNode);
  });

  test('downloads the raw response', async ({ downloads, shadow }) => {
    await (await shadow.find(ui.download)).click();
    await (await shadow.find(ui.downloadOption('raw'))).click();

    await expect.poll(downloads).toEqual([{ filename: 'sample.json', content: invalid }]);
  });

  test('explains why it cannot be formatted for download', async ({ downloads, shadow }) => {
    await (await shadow.find(ui.download)).click();
    await (await shadow.find(ui.downloadOption('formatted'))).click();

    expect(await (await shadow.find(ui.noticeHeader)).text()).toBe('Unable to download file');
    expect(await downloads()).toEqual([]);
  });
});
