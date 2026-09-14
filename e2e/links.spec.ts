import { expect, test } from './support/fixtures';
import { links } from './support/samples';
import { ui } from './support/ui';

const DOCS = 'https://example.com/docs';

test.beforeEach(async ({ open, shadow }) => {
  await open(links);
  await shadow.find(ui.tree);
});

test('marks urls and emails inside strings', async ({ shadow }) => {
  expect(await shadow.exists(`${ui.tree} .string.url[href="https://example.com/docs"]`)).toBe(true);
  expect(await shadow.exists(`${ui.tree} .string.email[href="mailto:hello@example.com"]`)).toBe(true);
});

test('leaves ordinary strings unlinked', async ({ shadow }) => {

  /*
   * Asserted positively as well, so a selector that stopped matching anything
   * could not pass this by finding nothing either way.
   */
  expect(await shadow.exists(`${ui.tree} .property:nth-child(3) > .string`)).toBe(true);
  expect(await shadow.exists(`${ui.tree} .property:nth-child(3) > .string[href]`)).toBe(false);
});

test('opens a url in a new tab when the modifier is held', async ({ context, page, shadow }) => {

  /*
   * Served from the test rather than the network, so the tab has something to
   * land on without leaving the machine.
   */
  await context.route(DOCS, route => route.fulfill({ contentType: 'text/html', body: '<h1>Docs</h1>' }));

  const opened = context.waitForEvent('page', { timeout: 10_000 });
  await page.keyboard.down('ControlOrMeta');
  await (await shadow.find(`${ui.tree} .string.url`)).click();
  await page.keyboard.up('ControlOrMeta');

  await expect(await opened).toHaveURL(DOCS);
});

test('leaves a url alone on a plain click', async ({ context, shadow }) => {
  await (await shadow.find(`${ui.tree} .string.url`)).click();

  // The wait is what gives a tab the chance to appear, so it has to be spent.
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
