import { type Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { type ShadowDom } from './support/shadow';
import { sample } from './support/samples';
import { ui } from './support/ui';

const runQuery = async (page: Page, shadow: ShadowDom, query: string) => {
  await (await shadow.find(ui.tab('query'))).click();
  await (await shadow.find(ui.queryInput)).click();
  await page.keyboard.type(query);
  await page.keyboard.press('Enter');
};

test.beforeEach(async ({ open }) => {
  await open(sample);
});

test('renders the result of a jq expression', async ({ page, shadow }) => {
  await runQuery(page, shadow, '.versions | map(.number)');

  const text = await (await shadow.find(ui.tree)).text();
  expect(text).toContain('"2.1.0"');
  expect(text).toContain('"2.0.0"');
  expect(text).not.toContain('"downloads"');
});

test('matches the query view', async ({ page, shadow }) => {
  await runQuery(page, shadow, '.tags');
  await shadow.find(ui.tree);

  await expect(page).toHaveScreenshot('query.png');
});

test('reports an invalid jq expression', async ({ page, shadow }) => {
  await runQuery(page, shadow, '.tags | nosuchfunction');

  const error = await shadow.find(ui.queryError);
  expect(await error.text()).toContain('nosuchfunction');
  await expect(page).toHaveScreenshot('query-error.png');
});
