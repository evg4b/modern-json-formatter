import { expect, test } from './support/fixtures';
import { links } from './support/samples';
import { ui } from './support/ui';

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

test('highlights links while the modifier is held', async ({ page, shadow }) => {
  const tree = await shadow.find(ui.tree);
  const classes = () => tree.evaluate<string>('function () { return this.className; }');

  expect(await classes()).not.toContain('active-links');

  await page.keyboard.down('ControlOrMeta');
  expect(await classes()).toContain('active-links');

  await page.keyboard.up('ControlOrMeta');
  expect(await classes()).not.toContain('active-links');
});
