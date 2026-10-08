import { expect, test } from './support/fixtures';
import { sample } from './support/samples';
import { ui } from './support/ui';

test.beforeEach(async ({ open }) => {
  await open(sample);
});

test('shows the untouched response on the raw tab', async ({ shadow }) => {
  await (await shadow.find(ui.tab('raw'))).click();

  expect(await (await shadow.find(ui.rawText)).text()).toBe(sample);
});

test('switches back to the formatted tab', async ({ shadow }) => {
  await (await shadow.find(ui.tab('raw'))).click();
  await (await shadow.find(ui.tab('formatted'))).click();

  expect(await (await shadow.find(ui.tree)).text()).toContain('"score":4.85');
});

test('matches the raw view', { tag: '@screenshot' }, async ({ page, shadow }) => {
  await (await shadow.find(ui.tab('raw'))).click();
  await shadow.find(ui.rawText);

  await expect(page).toHaveScreenshot('raw.png');
});

test('opens the download menu', { tag: '@screenshot' }, async ({ page, shadow }) => {
  await (await shadow.find(ui.download)).click();

  await expect(page).toHaveScreenshot('download-menu.png');
});
