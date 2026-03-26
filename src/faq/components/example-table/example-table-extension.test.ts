import { describe, expect, test } from '@rstest/core';
import { encodeAttrValue, exampleTableExtension } from './example-table-extension';

const makeTable = (query: string, input: string, output: string) =>
  `<table class="table table-borderless table-sm w-auto">
<tbody>
<tr>
<th class="pe-3">Query</th>
<td class="font-monospace">${query}</td>
</tr>
<tr>
<th>Input</th>
<td class="font-monospace">${input}</td>
</tr>
<tr>
<th>Output</th>
<td class="font-monospace">${output}</td>
</tr>
</tbody>
</table>`;

const getPostprocess = () => {
  const ext = exampleTableExtension();
  return ext.hooks!.postprocess!.bind({}) as (html: string) => string;
};

describe('encodeAttrValue', () => {
  test('trims leading and trailing whitespace', () => {
    expect(encodeAttrValue('  foo  ')).toBe('foo');
  });

  test('collapses internal whitespace and newlines', () => {
    expect(encodeAttrValue('a  b\n  c')).toBe('a b c');
  });

  test('escapes double quotes to &quot;', () => {
    expect(encodeAttrValue('"hello"')).toBe('&quot;hello&quot;');
  });

  test('escapes backticks to &#96;', () => {
    expect(encodeAttrValue('`x`')).toBe('&#96;x&#96;');
  });

  test('handles empty string', () => {
    expect(encodeAttrValue('')).toBe('');
  });

  test('preserves existing HTML entities', () => {
    expect(encodeAttrValue('. &lt; 5')).toBe('. &lt; 5');
  });

  test('handles multiple replacements in one value', () => {
    expect(encodeAttrValue('"a" `b`')).toBe('&quot;a&quot; &#96;b&#96;');
  });
});

describe('exampleTableExtension postprocess', () => {
  test('transforms matching table to mjf-example-table element', () => {
    const postprocess = getPostprocess();
    const result = postprocess(makeTable('.', '1', '1'));
    expect(result).toBe('<mjf-example-table query="." input="1" output="1"></mjf-example-table>');
  });

  test('does not transform non-matching tables', () => {
    const postprocess = getPostprocess();
    const input = '<table class="other"><tbody><tr><td>foo</td></tr></tbody></table>';
    expect(postprocess(input)).toBe(input);
  });

  test('transforms multiple tables in one HTML string', () => {
    const postprocess = getPostprocess();
    const table = makeTable('.', '1', '1');
    const result = postprocess(`${table}\n${table}`);
    expect((result.match(/<mjf-example-table /g) ?? []).length).toBe(2);
  });

  test('preserves HTML entities in attribute values', () => {
    const postprocess = getPostprocess();
    const result = postprocess(makeTable('. &lt; 5', '3', 'true'));
    expect(result).toContain('query=". &lt; 5"');
  });

  test('normalizes multiline query values', () => {
    const postprocess = getPostprocess();
    const result = postprocess(makeTable('\n  . as $x |\n  $x + 1\n', '1', '2'));
    expect(result).toContain('query=". as $x | $x + 1"');
  });

  test('escapes double quotes in values', () => {
    const postprocess = getPostprocess();
    const result = postprocess(makeTable('.', '"hello"', '"hello"'));
    expect(result).toContain('input="&quot;hello&quot;"');
    expect(result).toContain('output="&quot;hello&quot;"');
  });

  test('leaves surrounding HTML intact', () => {
    const postprocess = getPostprocess();
    const table = makeTable('.', '1', '1');
    const result = postprocess(`<div class="wrapper">${table}</div>`);
    expect(result).toBe('<div class="wrapper"><mjf-example-table query="." input="1" output="1"></mjf-example-table></div>');
  });

  test('does not transform table missing required rows', () => {
    const postprocess = getPostprocess();
    const input = `<table class="table table-borderless table-sm w-auto">
<tbody>
<tr><th>Query</th><td>.</td></tr>
</tbody>
</table>`;
    expect(postprocess(input)).toBe(input);
  });
});
