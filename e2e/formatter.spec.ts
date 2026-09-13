import { expect, test } from './support/fixtures';
import { sample } from './support/samples';
import { ui } from './support/ui';

// "tags" is the seventh property of the sample document.
const TAGS = 7;

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
    const content = await shadow.find(ui.tree);

    await (await shadow.find(ui.propertyToggle(TAGS))).click();

    const text = await content.text();
    expect(text).toContain('// 3 items');
    expect(text).not.toContain('"wasm"');
  });

  test('matches the formatted view', async ({ page, shadow }) => {
    await shadow.find(ui.tree);
    await shadow.find(ui.toolbar);

    await expect(page).toHaveScreenshot('formatted-dark.png');
  });
});

test.describe('formatted view in light theme', () => {
  test.use({ colorScheme: 'light' });

  test('matches the formatted view', async ({ open, page, shadow }) => {
    await open(sample);
    await shadow.find(ui.tree);
    await shadow.find(ui.toolbar);

    await expect(page).toHaveScreenshot('formatted-light.png');
  });
});

test('leaves non-JSON pages alone', async ({ open, page, shadow }) => {
  await open('<h1>Not JSON</h1>', 'text/html');

  await expect(page.locator('h1')).toHaveText('Not JSON');
  expect(await shadow.exists(ui.toolbar)).toBe(false);
});
