import { expect, test } from './support/fixtures';
import { ofLength } from './support/samples';
import { ui } from './support/ui';

const LIMIT = 927_182;

const large = JSON.stringify({ items: Array.from({ length: 60_000 }, (_, index) => ({ index, name: 'x' })) });

test.beforeEach(async ({ configure }) => {
  await configure({ maxFileSize: 1 });
});

test('formats a file over the size limit as plain text', async ({ open, shadow }) => {
  await open(large);

  const text = await (await shadow.find(ui.rawText)).text();

  expect(text.startsWith('{\n  "items": [\n    {\n      "index": 0,')).toBe(true);
  expect(JSON.parse(text)).toEqual(JSON.parse(large));
});

test('explains why a large file is not fully processed', async ({ open, shadow }) => {
  await open(large);

  expect(await (await shadow.find(ui.noticeHeader)).text()).toBe('File is too large');
  expect(await (await shadow.find(ui.notice)).text()).toContain('More than 1MB');
});

test('dismisses the notice', async ({ open, shadow }) => {
  await open(large);

  await (await shadow.find(ui.noticeClose)).click();

  await expect.poll(() => shadow.exists(ui.notice)).toBe(false);
});

test('shows no toolbar for a large file', async ({ open, shadow }) => {
  await open(large);
  await shadow.find(ui.rawText);

  expect(await shadow.exists(ui.toolbar)).toBe(false);
});

test('reports a large invalid file', async ({ open, shadow }) => {
  await open(large.slice(0, -3));

  const text = await (await shadow.find(ui.errorNode)).text();
  expect(text).toContain('Invalid JSON file.');
});

test('fully processes a file right at the size limit', async ({ open, shadow }) => {
  await open(ofLength(LIMIT));

  await shadow.find(ui.tree);
  await shadow.find(ui.toolbar);
});

test('treats a file one character over the limit as large', async ({ open, shadow }) => {
  await open(ofLength(LIMIT + 1));

  await shadow.find(ui.rawText);
  expect(await shadow.exists(ui.tree)).toBe(false);
});

test('follows a raised size limit', async ({ configure, open, shadow }) => {
  await configure({ maxFileSize: 2 });
  await open(large);

  await shadow.find(ui.tree);
  expect(await shadow.exists(ui.notice)).toBe(false);
});
