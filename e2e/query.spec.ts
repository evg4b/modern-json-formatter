import { type Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { type ShadowDom } from './support/shadow';
import { sample } from './support/samples';
import { ui } from './support/ui';

/*
 * Playwright hides the text caret before a screenshot by injecting CSS into the
 * document, which never reaches the input inside the closed shadow root. Left
 * alone it blinks between captures and shows up as a diff.
 */
const hideCaret = async (shadow: ShadowDom) => {
  const input = await shadow.find(ui.queryInput);
  await input.evaluate('function () { this.style.caretColor = "transparent"; }');
};

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

test('renders every result when the expression produces several', async ({ page, shadow }) => {
  await runQuery(page, shadow, '.versions[]');

  const tuple = await shadow.find(ui.tuple);
  const text = await tuple.text();
  expect(text).toContain('"2.1.0"');
  expect(text).toContain('"2.0.0"');
  expect(await shadow.exists(`${ui.tuple} > .root:nth-child(2)`)).toBe(true);
});

test('matches the query view', async ({ page, shadow }) => {
  await runQuery(page, shadow, '.tags');
  await shadow.find(ui.tree);
  await hideCaret(shadow);

  await expect(page).toHaveScreenshot('query.png');
});

test('reports an invalid jq expression', async ({ page, shadow }) => {
  await runQuery(page, shadow, '.tags | nosuchfunction');

  const error = await shadow.find(ui.queryError);
  expect(await error.text()).toContain('nosuchfunction');
  await hideCaret(shadow);
  await expect(page).toHaveScreenshot('query-error.png');
});
