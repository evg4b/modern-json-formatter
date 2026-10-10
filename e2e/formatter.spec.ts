import { expect, test } from './support/fixtures';
import { dragSelect } from './support/selection';
import { type ShadowDom } from './support/shadow';
import { invalid, nested, sample } from './support/samples';
import { ui } from './support/ui';

const TAGS = 7;
const VERSIONS = 8;
const META = 9;

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

  test('counts the properties of a collapsed root', async ({ shadow }) => {
    const content = await shadow.find(ui.tree);

    await (await shadow.find(ui.rootToggle)).click();

    await expect.poll(() => content.text()).toContain('// 9 properties');
  });

  test('hides the counters of expanded nodes', async ({ shadow }) => {
    const content = await shadow.find(ui.tree);

    expect(await content.text()).not.toContain('//');
  });

  test('collapses a nested array', async ({ shadow }) => {
    const tree = await collapseTags(shadow);

    expect(await tree.text()).not.toContain('"wasm"');
  });

  test('keeps a nested node collapsed while its parent is collapsed and expanded', async ({ shadow }) => {
    const tree = await collapseTags(shadow);
    const root = await shadow.find(ui.rootToggle);

    await root.click();
    await root.click();

    await expect.poll(() => tree.text()).toContain('"versions"');
    expect(await tree.text()).toContain('// 3 items');
    expect(await tree.text()).not.toContain('"wasm"');
  });

  test('offers no toggle for empty objects and arrays', async ({ shadow }) => {
    await shadow.find(ui.tree);
    const meta = `${ui.property(META)} > .object > .inner`;

    expect(await shadow.exists(`${meta} > .property:nth-child(1) > .toggle`)).toBe(false);
    expect(await shadow.exists(`${meta} > .property:nth-child(2) > .toggle`)).toBe(false);
    expect(await shadow.exists(ui.propertyToggle(META))).toBe(true);
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

  test('matches the collapsed view', { tag: '@screenshot' }, async ({ page, shadow }) => {
    await collapseTags(shadow);
    await (await shadow.find(ui.arrayItemToggle(VERSIONS, 2))).click();
    await shadow.find(ui.toolbar);

    await expect(page).toHaveScreenshot('collapsed.png');
  });
});

test.describe('document shapes', () => {
  const roots = [
    { name: 'true', body: 'true' },
    { name: 'false', body: 'false' },
    { name: 'null', body: 'null' },
    { name: 'a number', body: '42' },
    { name: 'zero', body: '0' },
    { name: 'a negative number', body: '-21' },
    { name: 'a fraction', body: '3.14' },
    { name: 'an exponent', body: '-12.5e-3' },
    { name: 'a string', body: '"text"' },
    { name: 'a numeric string', body: '"213123"' },
    { name: 'an empty string', body: '""' },
    { name: 'an empty array', body: '[]' },
    { name: 'an empty object', body: '{}' },
  ];

  for (const { name, body } of roots) {
    test(`renders ${name} at the root`, async ({ open, shadow }) => {
      await open(body);

      expect(await (await shadow.find(ui.tree)).text()).toBe(body);
      expect(await shadow.exists(ui.rootToggle)).toBe(false);
    });
  }

  test('renders an array at the root', async ({ open, shadow }) => {
    await open('[{"id":1},{"id":2}]');

    const tree = await shadow.find(ui.tree);
    await (await shadow.find(`${ui.tree} > .array > .inner > .item:nth-child(2) > .toggle`)).click();

    await expect.poll(() => tree.text()).toContain('// 1 property');
    expect(await tree.text()).toContain('"id":1');
    expect(await tree.text()).not.toContain('"id":2');
  });

  test('uses the singular for a single item', async ({ open, shadow }) => {
    await open('{"list":[1]}');

    const tree = await shadow.find(ui.tree);
    await (await shadow.find(ui.propertyToggle(1))).click();

    await expect.poll(() => tree.text()).toContain('// 1 item');
    expect(await tree.text()).not.toContain('// 1 items');
  });

  test('keeps keys in the order they were written', async ({ open, shadow }) => {
    await open('{"b":1,"a":2,"10":3,"1":4}');

    const text = await (await shadow.find(ui.tree)).text();

    expect(text.replaceAll('\n', '')).toBe('{"b":1,"a":2,"10":3,"1":4}');
  });

  test('keeps every duplicated key', async ({ open, shadow }) => {
    await open('{"a":1,"a":2}');

    const text = await (await shadow.find(ui.tree)).text();

    expect(text).toContain('"a":1');
    expect(text).toContain('"a":2');
  });

  test('keeps numbers exactly as written', async ({ open, shadow }) => {
    const numbers = ['1.50', '1e400', '-0', '1E+2', '-12.5e-3', '0.1000000000000000055511151231257827'];
    await open(`[${numbers.join(', ')}]`);

    const text = await (await shadow.find(ui.tree)).text();

    expect(text.split(/[\n,[\]]+/).filter(Boolean)).toEqual(numbers);
  });

  test('renders escaped and unicode characters', async ({ open, shadow }) => {
    await open(String.raw`{"text":"line\nbreak \"quoted\" é 😀 \\ end","ключ":"значение"}`);

    const text = await (await shadow.find(ui.tree)).text();

    expect(text).toContain(String.raw`"text":"line\nbreak \"quoted\" é 😀 \\ end"`);
    expect(text).toContain('"ключ":"значение"');
  });

  test('formats a document with surrounding whitespace', async ({ open, shadow }) => {
    await open('\n\t  {"padded": true}  \n');

    expect(await (await shadow.find(ui.tree)).text()).toContain('"padded":true');
  });

  test('formats JSON served as plain text', async ({ open, shadow }) => {
    await open('{"plain": "text"}', { contentType: 'text/plain' });

    expect(await (await shadow.find(ui.tree)).text()).toContain('"plain":"text"');
  });

  test('renders deeply nested documents', async ({ open, shadow }) => {
    await open(nested(150));

    expect(await (await shadow.find(ui.tree)).text()).toContain('"a":"deep"');
  });

  test('renders long arrays', async ({ open, shadow }) => {
    await open(JSON.stringify(Array.from({ length: 5000 }, (_, index) => ({ index }))));

    const text = await (await shadow.find(ui.tree)).text();

    expect(text).toContain('"index":0');
    expect(text).toContain('"index":4999');
  });
});

test.describe('invalid documents', () => {
  const documents = [
    { name: 'a truncated document', body: invalid, reason: 'byte offset' },
    { name: 'an unclosed array', body: '[1, 2', reason: 'comma or end of sequence expected' },
    { name: 'trailing content', body: '{"a":1} x', reason: 'end of file expected' },
    { name: 'an unterminated string', body: '["open', reason: 'unterminated string' },
  ];

  for (const { name, body, reason } of documents) {
    test(`reports ${name}`, async ({ open, shadow }) => {
      await open(body);

      const error = await shadow.find(ui.errorNode);
      const text = await error.text();
      expect(text).toContain('Invalid JSON file.');
      expect(text).toContain(reason);
    });
  }

  test('keeps the toolbar for an invalid document', async ({ open, shadow }) => {
    await open(invalid);
    await shadow.find(ui.errorNode);

    expect(await shadow.exists(ui.tab('raw'))).toBe(true);
    expect(await shadow.exists(ui.download)).toBe(true);
  });

  test('matches the invalid document view', { tag: '@screenshot' }, async ({ open, page, shadow }) => {
    await open(invalid);
    await shadow.find(ui.errorNode);
    await shadow.find(ui.toolbar);

    await expect(page).toHaveScreenshot('invalid.png');
  });
});

test.describe('pages that are not JSON', () => {
  const pages = [
    { name: 'an HTML page', body: '<h1>Not JSON</h1>', text: 'Not JSON', contentType: 'text/html' },
    { name: 'plain text', body: 'hello world', text: 'hello world', contentType: 'text/plain' },
    { name: 'an empty response', body: '', text: '', contentType: 'application/json' },
    { name: 'a blank response', body: '   \n  ', text: '', contentType: 'application/json' },
    { name: 'text that starts like a number', body: '42 is the answer', text: '42 is the answer', contentType: 'text/plain' },
    { name: 'text that starts like a literal', body: 'nullable', text: 'nullable', contentType: 'text/plain' },
  ];

  for (const { name, body, text, contentType } of pages) {
    test(`leaves ${name} alone`, async ({ open, page, shadow }) => {
      await open(body, { contentType });

      await expect(page.locator('body')).toHaveText(text);
      expect(await shadow.exists(ui.toolbar)).toBe(false);
      expect(await shadow.exists(ui.container)).toBe(false);
    });
  }
});

test.describe('HTTP error responses', () => {
  const responses = [
    '400 Bad Request',
    '401 Unauthorized',
    '403 Forbidden',
    '404 Not Found',
    '404 page not found',
    '500 Internal Server Error',
    '502 Bad Gateway',
    '503 Service Unavailable',
    'Not Found',
    'Forbidden',
  ];

  for (const body of responses) {
    for (const contentType of ['text/plain', 'application/json']) {
      test(`leaves "${body}" served as ${contentType} alone`, async ({ open, page, shadow }) => {
        await open(body, { contentType });

        await expect(page.locator('body')).toHaveText(body);
        expect(await shadow.exists(ui.toolbar)).toBe(false);
        expect(await shadow.exists(ui.container)).toBe(false);
      });
    }
  }

  test('leaves an HTML error page alone', async ({ open, page, shadow }) => {
    await open('<html><head><title>404 Not Found</title></head><body><center><h1>404 Not Found</h1></center><hr><center>nginx</center></body></html>', { contentType: 'text/html' });

    await expect(page.locator('h1')).toHaveText('404 Not Found');
    expect(await shadow.exists(ui.toolbar)).toBe(false);
    expect(await shadow.exists(ui.container)).toBe(false);
  });

  test('formats a JSON error body', async ({ open, shadow }) => {
    await open('{"status":404,"error":"Not Found"}');

    expect(await (await shadow.find(ui.tree)).text()).toContain('"error":"Not Found"');
  });

  test('formats a JSON string error body', async ({ open, shadow }) => {
    await open('"Not Found"');

    expect(await (await shadow.find(ui.tree)).text()).toBe('"Not Found"');
  });
});
