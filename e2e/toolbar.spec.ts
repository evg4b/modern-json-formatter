import { expect, test } from './support/fixtures';
import { type ShadowDom } from './support/shadow';
import { invalid, sample } from './support/samples';
import { type Tab, ui } from './support/ui';

const TABS: Tab[] = ['query', 'formatted', 'raw'];

const activeTabs = async (shadow: ShadowDom) => {
  const active: Tab[] = [];
  for (const tab of TABS) {
    const button = await shadow.find(ui.tab(tab));
    if (await button.evaluate<boolean>('function () { return this.classList.contains("active"); }')) {
      active.push(tab);
    }
  }

  return active;
};

test.describe('with a valid document', () => {
  test.beforeEach(async ({ open, shadow }) => {
    await open(sample);
    await shadow.find(ui.tree);
  });

  test('starts on the formatted tab', async ({ shadow }) => {
    expect(await activeTabs(shadow)).toEqual(['formatted']);
    expect(await shadow.exists(ui.queryInput)).toBe(false);
  });

  test('shows the untouched response on the raw tab', async ({ shadow }) => {
    await (await shadow.find(ui.tab('raw'))).click();

    expect(await (await shadow.find(ui.rawText)).text()).toBe(sample);
  });

  test('marks the tab that was chosen', async ({ shadow }) => {
    for (const tab of TABS) {
      await (await shadow.find(ui.tab(tab))).click();

      await expect.poll(() => activeTabs(shadow)).toEqual([tab]);
    }
  });

  test('shows the query input only on the query tab', async ({ shadow }) => {
    await (await shadow.find(ui.tab('query'))).click();
    await shadow.find(ui.queryInput);

    await (await shadow.find(ui.tab('raw'))).click();
    await expect.poll(() => shadow.exists(ui.queryInput)).toBe(false);
  });

  test('switches back to the formatted tab', async ({ shadow }) => {
    await (await shadow.find(ui.tab('raw'))).click();
    await (await shadow.find(ui.tab('formatted'))).click();

    expect(await (await shadow.find(ui.tree)).text()).toContain('"score":4.85');
  });

  test('keeps collapsed nodes collapsed across tab switches', async ({ shadow }) => {
    await (await shadow.find(ui.rootToggle)).click();

    await (await shadow.find(ui.tab('raw'))).click();
    await shadow.find(ui.rawText);
    await (await shadow.find(ui.tab('formatted'))).click();

    await expect.poll(async () => (await shadow.find(ui.tree)).text()).toContain('// 9 properties');
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
});

test('keeps the toolbar in view while the document scrolls', async ({ open, page, shadow }) => {
  await open(JSON.stringify(Array.from({ length: 200 }, (_, index) => ({ index }))));
  const top = (path: string) => async () => (await shadow.find(path))
    .evaluate<number>('function () { return this.getBoundingClientRect().top; }');
  const treeTop = await top(ui.tree)();
  const toolbarTop = await top(ui.toolbar)();

  await page.mouse.wheel(0, 2000);

  await expect.poll(top(ui.tree)).toBeLessThan(treeTop);
  expect(await top(ui.toolbar)()).toBe(toolbarTop);
});

test('shows the untouched response of an invalid document on the raw tab', async ({ open, shadow }) => {
  await open(invalid);
  await shadow.find(ui.errorNode);

  await (await shadow.find(ui.tab('raw'))).click();

  expect(await (await shadow.find(ui.rawText)).text()).toBe(invalid);
});
