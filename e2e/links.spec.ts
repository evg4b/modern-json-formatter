import { expect, test } from './support/fixtures';
import { links } from './support/samples';
import { ui } from './support/ui';

const DOCS = 'https://example.com/docs';

test.beforeEach(async ({ open, shadow }) => {
  await open(links);
  await shadow.find(ui.tree);
});

test('marks urls and emails inside strings', async ({ shadow }) => {
  expect(await shadow.exists(`${ui.tree} .string.url[href="${DOCS}"]`)).toBe(true);
  expect(await shadow.exists(`${ui.tree} .string.email[href="mailto:hello@example.com"]`)).toBe(true);
});

test('leaves ordinary strings unlinked', async ({ shadow }) => {
  expect(await shadow.exists(`${ui.tree} .property:nth-child(3) > .string`)).toBe(true);
  expect(await shadow.exists(`${ui.tree} .property:nth-child(3) > .string[href]`)).toBe(false);
});

test('opens a url in a new tab when the modifier is held', async ({ context, page, shadow }) => {
  await context.route(DOCS, route => route.fulfill({ contentType: 'text/html', body: '<h1>Docs</h1>' }));

  const opened = context.waitForEvent('page');
  await page.keyboard.down('ControlOrMeta');
  await (await shadow.find(`${ui.tree} .string.url`)).click();
  await page.keyboard.up('ControlOrMeta');

  await expect(await opened).toHaveURL(DOCS);
});

test('leaves a url alone on a plain click', async ({ context, shadow }) => {
  await (await shadow.find(`${ui.tree} .string.url`)).click();

  expect(await context.waitForEvent('page', { timeout: 1000 }).catch(() => null)).toBeNull();
});

test('highlights links while the modifier is held', async ({ page, shadow }) => {
  const tree = await shadow.find(ui.tree);
  const classes = () => tree.evaluate<string>('function () { return this.className; }');

  expect(await classes()).not.toContain('active-links');

  await page.keyboard.down('ControlOrMeta');
  expect(await classes()).toContain('active-links');

  await page.keyboard.up('ControlOrMeta');
  expect(await classes()).not.toContain('active-links');
});

test.describe('link detection', () => {
  const strings = [
    { value: 'http://example.com', href: 'http://example.com' },
    { value: 'ftp://example.com/file', href: 'ftp://example.com/file' },
    { value: ' https://example.com/padded ', href: 'https://example.com/padded' },
    { value: 'mailto:hello@example.com', href: 'mailto:hello@example.com' },
    { value: 'www.example.com', href: null },
    { value: '/relative/path', href: null },
    { value: 'user@localhost', href: null },
  ];

  test.beforeEach(async ({ open, shadow }) => {
    await open(JSON.stringify(strings.map(({ value }) => value)));
    await shadow.find(ui.tree);
  });

  for (const [index, { value, href }] of strings.entries()) {
    test(`${href ? 'links' : 'does not link'} ${JSON.stringify(value)}`, async ({ shadow }) => {
      const string = await shadow.find(`${ui.tree} > .array > .inner > .item:nth-child(${index + 1}) > .string`);

      expect(await string.evaluate<string | null>('function () { return this.getAttribute("href"); }')).toBe(href);
    });
  }
});
