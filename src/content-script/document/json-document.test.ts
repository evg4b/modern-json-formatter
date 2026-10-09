import '@testing/background.mock';
import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { download, format, jq, tokenize } from '@core/background';
import { wrapMock } from '@testing/helpers';
import { tErrorNode, tNull, tObject, tProperty, tString, tTuple } from '@testing/json';
import { JsonDocument, ONE_MEGABYTE_LENGTH } from './json-document';

const url = 'https://api.example.com/v1/users.json';
const content = '{ "key": "value" }';
const open = (text = content, maxFileSize = 3) => new JsonDocument(text, { url, maxFileSize });
const oversized = () => open('X'.repeat(ONE_MEGABYTE_LENGTH * 3 + 1));

describe('JsonDocument', () => {
  beforeEach(() => {
    rstest.resetAllMocks();
  });

  describe('oversized', () => {
    test('is false within the limit', () => {
      expect(open('X'.repeat(ONE_MEGABYTE_LENGTH * 3)).oversized).toBe(false);
    });

    test('is true above the limit', () => {
      expect(oversized().oversized).toBe(true);
    });

    test('follows the configured limit', () => {
      expect(open('X'.repeat(ONE_MEGABYTE_LENGTH * 4), 5).oversized).toBe(false);
    });
  });

  describe('render', () => {
    test('tokenizes a document within the limit', async () => {
      const node = tObject(tProperty('key', tString('value')));
      wrapMock(tokenize).mockResolvedValue(node);

      expect(await open().render()).toEqual({ type: 'tree', node });
      expect(tokenize).toHaveBeenCalledWith(content);
      expect(format).not.toHaveBeenCalled();
    });

    test('reports invalid JSON', async () => {
      wrapMock(tokenize).mockRejectedValue(tErrorNode('expected value at line 1', 'tokenizer'));

      expect(await open('{ "broken": ').render()).toEqual({
        type: 'failure',
        failure: { header: 'Invalid JSON file.', lines: ['expected value at line 1'] },
      });
    });

    test('reports a worker failure', async () => {
      wrapMock(tokenize).mockRejectedValue(new Error('disconnected'));

      expect(await open().render()).toEqual({
        type: 'failure',
        failure: { header: 'Failed to process file', lines: ['disconnected'] },
      });
    });

    test('formats an oversized document as text', async () => {
      wrapMock(format).mockResolvedValue('formatted');

      expect(await oversized().render()).toEqual({
        type: 'text',
        text: 'formatted',
        notice: {
          header: 'File is too large',
          content: 'File is too large to be processed (More than 3MB). It has been formatted instead.',
        },
      });
      expect(tokenize).not.toHaveBeenCalled();
    });

    test('reports invalid JSON in an oversized document', async () => {
      wrapMock(format).mockRejectedValue(tErrorNode('trailing comma', 'tokenizer'));

      expect(await oversized().render()).toEqual({
        type: 'failure',
        failure: { header: 'Invalid JSON file.', lines: ['trailing comma'] },
      });
    });
  });

  describe('query', () => {
    test('runs the query with the page url so it is recorded', async () => {
      const node = tTuple(tNull());
      wrapMock(jq).mockResolvedValue(node);

      expect(await open().query('.key')).toEqual({ type: 'tree', node });
      expect(jq).toHaveBeenCalledWith(content, '.key', url);
    });

    test('reports an invalid query', async () => {
      wrapMock(jq).mockRejectedValue(tErrorNode('unknown function', 'jq'));

      expect(await open().query('nope')).toEqual({ type: 'invalid-query', message: 'unknown function' });
    });

    test('reports a worker error with its stack', async () => {
      wrapMock(jq).mockRejectedValue({ ...tErrorNode('crashed'), stack: 'stack' });

      expect(await open().query('.')).toEqual({
        type: 'notice',
        notice: { header: 'Error crashed in worker', content: 'Stack trace: stack' },
      });
    });

    test('reports an unexpected error', async () => {
      wrapMock(jq).mockRejectedValue('unexpected');

      expect(await open().query('.')).toEqual({
        type: 'notice',
        notice: { header: 'Unexpected error', content: 'unexpected' },
      });
    });
  });

  describe('download', () => {
    const cases = [
      { type: 'raw', filename: 'users.json' },
      { type: 'formatted', filename: 'users_formatted.json' },
      { type: 'minified', filename: 'users_minified.json' },
    ] as const;

    test.each(cases)('$type is saved as $filename', async ({ type, filename }) => {
      expect(await open().download(type)).toBeNull();
      expect(download).toHaveBeenCalledWith(type, content, filename);
    });

    describe('reports a failure', () => {
      const failures = [
        { name: 'ErrorNode', error: tErrorNode('failed'), expected: 'failed' },
        { name: 'Error', error: new Error('network failure'), expected: 'network failure' },
        { name: 'string', error: 'raw string error', expected: 'raw string error' },
      ];

      test.each(failures)('$name', async ({ error, expected }) => {
        wrapMock(download).mockRejectedValue(error);

        expect(await open().download('raw')).toEqual({ header: 'Unable to download file', content: expected });
      });
    });
  });
});
