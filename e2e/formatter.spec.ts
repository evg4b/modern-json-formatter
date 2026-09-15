import { expect, test } from './support/fixtures';
import { dragSelect } from './support/selection';
import { type ShadowDom } from './support/shadow';
import { sample } from './support/samples';
import { ui } from './support/ui';

const TAGS = 7;
const VERSIONS = 8;

const collapseTags = async (shadow: ShadowDom) => {
  const tree = await shadow.find(ui.tree);
  await (await shadow.find(ui.propertyToggle(TAGS))).click();
  await expect.poll(() => tree.text()).toContain('// 3 items');

  return tree;
};

test.describe('formatted view', () => {
  test.beforeEach(async ({ open }) => {
    await open(sample);
  });

  test('renders every value of the document', async ({ shadow }) => {
    const content = await shadow.find(ui.tree);
    const text = await content.text();

    expect(text).toContain('"name":"Modern JSON Formatter"');
    expect(text).toContain('"active":true');
    expect(text).toContain('"description":null');
    expect(text).toContain('"score":4.85');
    expect(text).toContain('"empty":{}');
  });

  test('keeps numbers too large for JavaScript intact', async ({ shadow }) => {
    const content = await shadow.find(ui.tree);

    expect(await content.text()).toContain('"id":9007199254740993');
  });

  test('collapses and expands the root node', async ({ shadow }) => {
    const content = await shadow.find(ui.tree);
    const toggle = await shadow.find(ui.rootToggle);

    await toggle.click();
    expect(await content.text()).not.toContain('"name":"Modern JSON Formatter"');

    await toggle.click();
    expect(await content.text()).toContain('"name":"Modern JSON Formatter"');
  });

  test('collapses a nested array', async ({ shadow }) => {
    const tree = await collapseTags(shadow);

    expect(await tree.text()).not.toContain('"wasm"');
  });

  test('stays valid JSON when the page is selected and copied', async ({ copyAll }) => {
    const copied = await copyAll(ui.tree);

    expect(JSON.parse(copied)).toEqual(JSON.parse(sample));
    expect(copied).toContain('9007199254740993');
  });

  test('expands a collapsed node again', async ({ shadow }) => {
    const tree = await collapseTags(shadow);

    await (await shadow.find(ui.propertyToggle(TAGS))).click();

    await expect.poll(() => tree.text()).toContain('"wasm"');
  });

  test('collapses one array item without touching the rest', async ({ shadow }) => {
    const tree = await shadow.find(ui.tree);

    await (await shadow.find(ui.arrayItemToggle(VERSIONS, 1))).click();

    await expect.poll(() => tree.text()).toContain('// 2 properties');
    const text = await tree.text();
    expect(text).not.toContain('"2.1.0"');
    expect(text).toContain('"2.0.0"');
  });

  test('copies only the part that is selected', async ({ copySelection, page, shadow }) => {
    const version = ui.arrayItem(VERSIONS, 1);
    await dragSelect(
      page,
      await shadow.find(`${version} > .object > .bracket-open`),
      await shadow.find(`${version} > .object > .bracket-close`),
    );

    expect(JSON.parse(await copySelection())).toEqual({ number: '2.1.0', downloads: 12045 });
  });

  test('keeps the markers of a collapsed node out of the copy', async ({ copyAll, shadow }) => {
    await collapseTags(shadow);

    const copied = await copyAll(ui.tree);

    expect(JSON.parse(copied)).toMatchObject({ tags: [] });
    expect(copied).not.toContain('// 3 items');
  });

  test('matches the formatted view', { tag: '@screenshot' }, async ({ page, shadow }) => {
    await shadow.find(ui.tree);
    await shadow.find(ui.toolbar);

    await expect(page).toHaveScreenshot('formatted.png');
  });
});

test('leaves non-JSON pages alone', async ({ open, page, shadow }) => {
  await open('<h1>Not JSON</h1>', 'text/html');

  await expect(page.locator('h1')).toHaveText('Not JSON');
  expect(await shadow.exists(ui.toolbar)).toBe(false);
});
