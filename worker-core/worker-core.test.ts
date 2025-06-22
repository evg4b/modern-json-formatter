import '@testing/browser.mock';
import { beforeAll, describe, jest, test } from '@jest/globals';
import { tNumber, tObject, tProperty } from '@testing';
import { readFileSync } from 'fs';
import { format, initialize, jq, tokenize } from './index';

jest.mock('./helpers.ts', () => ({
  loadWasm: (file: string, imports: WebAssembly.Imports) => {
    expect(file).toBe('worker-core.wasm');
    return WebAssembly.instantiate(readFileSync('worker-core/worker-core.wasm'), imports);
  },
}));

describe('worker-core.wasm', () => {
  beforeAll(() => initialize());

  describe('tokenize', () => {
    test('should return a TokenizerResponse', async () => {
      const data = await tokenize('{ "data": 123 }');

      expect(data).toEqual(tObject(tProperty('data', tNumber(`123`))));
    });
  });

  describe('jq', () => {
    test('should return a TokenizerResponse', async () => {
      const data = await jq({ json: '{ "data": 123 }', query: '.data' });

      expect(data).toEqual(tNumber(`123`));
    });
  });

  describe('format', () => {
    test('should return a TokenizerResponse', async () => {
      const data = await format('{ "data": 123 }');

      expect(data).toEqual(`{\n    "data": 123\n}`);
    });
  });
});

