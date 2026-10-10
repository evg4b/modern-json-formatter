import { expect, test } from './support/fixtures';
import { type ShadowDom } from './support/shadow';
import { sample } from './support/samples';
import { ui } from './support/ui';

const hideCaret = async (shadow: ShadowDom) => {
  const input = await shadow.find(ui.queryInput);
  await input.evaluate('function () { this.style.caretColor = "transparent"; }');
};

const inputValue = async (shadow: ShadowDom) => {
  const input = await shadow.find(ui.queryInput);

  return input.evaluate<string>('function () { return this.value; }');
};

const historyOptions = async (shadow: ShadowDom) => {
  const list = await shadow.find(ui.history);

  return list.evaluate<string[]>('function () { return [...this.options].map(option => option.value); }');
};

const openQueryTab = async (shadow: ShadowDom) => {
  await (await shadow.find(ui.tab('query'))).click();
  await shadow.find(ui.queryInput);
};

test.describe('running queries', () => {
  test.beforeEach(async ({ open }) => {
    await open(sample);
  });

  test('renders the result of a jq expression', async ({ query, shadow }) => {
    await query('.versions | map(.number)');

    const text = await (await shadow.find(ui.tree)).text();
    expect(text).toContain('"2.1.0"');
    expect(text).toContain('"2.0.0"');
    expect(text).not.toContain('"downloads"');
  });

  test('renders every result when the expression produces several', async ({ query, shadow }) => {
    await query('.versions[]');

    const tuple = await shadow.find(ui.tuple);
    const text = await tuple.text();
    expect(text).toContain('"2.1.0"');
    expect(text).toContain('"2.0.0"');
    expect(await shadow.exists(`${ui.tuple} > .root:nth-child(2)`)).toBe(true);
  });

  test('keeps numbers too large for JavaScript intact', async ({ query, shadow }) => {
    await query('.id');

    expect(await (await shadow.find(ui.tree)).text()).toBe('9007199254740993');
  });

  test('renders null for a missing key', async ({ query, shadow }) => {
    await query('.missing');

    expect(await (await shadow.find(ui.tree)).text()).toBe('null');
  });

  test('renders nothing for an expression without output', async ({ query, shadow }) => {
    await query('.versions[] | select(.downloads > 1000000)');

    const tuple = await shadow.find(ui.tuple);
    expect(await tuple.text()).toBe('');
    expect(await shadow.exists(ui.queryError)).toBe(false);
  });

  test('replaces the previous result with the next one', async ({ query, shadow }) => {
    await query('.name');
    await expect.poll(async () => (await shadow.find(ui.tree)).text()).toBe('"Modern JSON Formatter"');

    await query('.score');

    await expect.poll(async () => (await shadow.find(ui.tree)).text()).toBe('4.85');
  });

  test('collapses a node of the result', async ({ query, shadow }) => {
    await query('.versions');
    const tree = await shadow.find(ui.tree);

    await (await shadow.find(ui.rootToggle)).click();

    await expect.poll(() => tree.text()).toContain('// 2 items');
    expect(await tree.text()).not.toContain('"2.1.0"');
  });

  test('marks links in the result', async ({ query, shadow }) => {
    await query('"https://example.com/docs"');

    await shadow.find(`${ui.tree} > .string.url[href="https://example.com/docs"]`);
  });

  test('leaves the formatted view untouched', async ({ query, shadow }) => {
    await query('.tags');
    await shadow.find(ui.tree);

    await (await shadow.find(ui.tab('formatted'))).click();

    await expect.poll(async () => (await shadow.find(ui.tree)).text()).toContain('"name":"Modern JSON Formatter"');
  });

  test('keeps the result when coming back to the query tab', async ({ query, shadow }) => {
    await query('.tags');
    await shadow.find(ui.tree);

    await (await shadow.find(ui.tab('raw'))).click();
    await shadow.find(ui.rawText);
    await (await shadow.find(ui.tab('query'))).click();

    const text = await (await shadow.find(ui.tree)).text();
    expect(text).toContain('"wasm"');
    expect(text).not.toContain('"name"');
  });

  test('matches the query view', { tag: '@screenshot' }, async ({ page, query, shadow }) => {
    await query('.tags');
    await shadow.find(ui.tree);
    await hideCaret(shadow);

    await expect(page).toHaveScreenshot('query.png');
  });
});

test.describe('query errors', () => {
  test.beforeEach(async ({ open }) => {
    await open(sample);
  });

  test('reports an invalid jq expression', { tag: '@screenshot' }, async ({ page, query, shadow }) => {
    await query('.tags | nosuchfunction');

    const error = await shadow.find(ui.queryError);
    expect(await error.text()).toContain('nosuchfunction');
    await hideCaret(shadow);
    await expect(page).toHaveScreenshot('query-error.png');
  });

  test('reports an empty expression', async ({ query, shadow }) => {
    await query('');

    expect(await (await shadow.find(ui.queryError)).text()).toContain('unexpected end of input');
  });

  test('reports an error raised while the expression runs', async ({ query, shadow }) => {
    await query('.name | tonumber');

    expect(await (await shadow.find(ui.queryError)).text()).not.toBe('');
  });

  test('clears the error as soon as the expression is edited', async ({ page, query, shadow }) => {
    await query('.tags | nosuchfunction');
    await shadow.find(ui.queryError);

    await page.keyboard.press('Backspace');

    await expect.poll(() => shadow.exists(ui.queryError)).toBe(false);
  });

  test('keeps the previous result next to the error', async ({ query, shadow }) => {
    await query('.tags');
    await shadow.find(ui.tree);

    await query('.tags | nosuchfunction');
    await shadow.find(ui.queryError);

    expect(await (await shadow.find(ui.tree)).text()).toContain('"wasm"');
  });
});

test.describe('query input', () => {
  test.beforeEach(async ({ open, shadow }) => {
    await open(sample);
    await openQueryTab(shadow);
  });

  test('takes focus when the query tab opens', async ({ shadow }) => {
    const input = await shadow.find(ui.queryInput);

    expect(await input.evaluate<boolean>('function () { return this.getRootNode().activeElement === this; }')).toBe(true);
  });

  test('runs the query on enter', async ({ page, shadow }) => {
    await page.keyboard.type('.active');
    await page.keyboard.press('Enter');

    expect(await (await shadow.find(ui.tree)).text()).toBe('true');
  });

  for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}'], ['"', '"'], ['\'', '\''], ['`', '`']]) {
    test(`wraps the selection in ${open}${close}`, async ({ page, shadow }) => {
      await page.keyboard.type('.tags');
      await page.keyboard.press('Shift+Home');

      await page.keyboard.type(open);

      expect(await inputValue(shadow)).toBe(`${open}.tags${close}`);
    });
  }

  test('types a bracket as is when nothing is selected', async ({ page, shadow }) => {
    await page.keyboard.type('.tags[');

    expect(await inputValue(shadow)).toBe('.tags[');
  });

  test('undoes and redoes edits', async ({ page, shadow }) => {
    await page.keyboard.type('.tags');
    await page.keyboard.press('Shift+Home');
    await page.keyboard.type('[');
    expect(await inputValue(shadow)).toBe('[.tags]');

    await page.keyboard.press('ControlOrMeta+z');
    expect(await inputValue(shadow)).toBe('.tags');

    await page.keyboard.press('ControlOrMeta+Shift+z');
    expect(await inputValue(shadow)).toBe('[.tags]');
  });
});

test.describe('query history', () => {
  test('offers a successful query from history after a reload', async ({ open, query, shadow }) => {
    await open(sample);
    await query('.tags');
    await shadow.find(ui.tree);

    await open(sample);
    await (await shadow.find(ui.tab('query'))).click();

    const option = await shadow.find(ui.historyOption);
    expect(await option.evaluate<string>('function () { return this.value; }')).toBe('.tags');
  });

  test('offers the latest queries first, each one once', async ({ open, query, shadow }) => {
    await open(sample);
    for (const expression of ['.tags', '.name', '.tags', '.score']) {
      await query(expression);
      await shadow.find(ui.tree);
    }

    await open(sample);
    await openQueryTab(shadow);

    await expect.poll(() => historyOptions(shadow)).toEqual(['.score', '.tags', '.name']);
  });

  test('leaves failed queries out of the history', async ({ open, query, shadow }) => {
    await open(sample);
    await query('.tags');
    await shadow.find(ui.tree);
    await query('.tags | nosuchfunction');
    await shadow.find(ui.queryError);

    await open(sample);
    await openQueryTab(shadow);

    await expect.poll(() => historyOptions(shadow)).toEqual(['.tags']);
  });

  test('narrows the history down to what was typed', async ({ open, page, query, shadow }) => {
    await open(sample);
    for (const expression of ['.tags', '.name', '.tags[0]']) {
      await query(expression);
      await shadow.find(ui.tree);
    }

    await open(sample);
    await openQueryTab(shadow);
    await page.keyboard.type('.t');

    await expect.poll(() => historyOptions(shadow)).toEqual(['.tags[0]', '.tags']);
  });

  test('offers at most ten queries', async ({ open, query, shadow }) => {
    await open(sample);
    for (let index = 0; index < 12; index++) {
      await query(`.tags[${index % 3}] | . + "${index}"`);
      await shadow.find(ui.tree);
    }

    await open(sample);
    await openQueryTab(shadow);

    await expect.poll(() => historyOptions(shadow)).toHaveLength(10);
    expect((await historyOptions(shadow))[0]).toBe('.tags[2] | . + "11"');
  });

  test('keeps the history of each site apart', async ({ open, query, shadow }) => {
    const other = 'https://other.test/sample.json';
    await open(sample);
    await query('.tags');
    await shadow.find(ui.tree);
    await open(sample, { url: other });
    await query('.name');
    await shadow.find(ui.tree);

    await open(sample, { url: other });
    await openQueryTab(shadow);

    await expect.poll(() => historyOptions(shadow)).toEqual(['.name']);
  });
});
