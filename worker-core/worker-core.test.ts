import '@testing/browser.mock';
import { afterAll, beforeAll, describe, expect, test } from '@rstest/core';
import { tNumber, tObject, tProperty } from '@testing';
import { readFileSync } from 'fs';
import { rstest } from '@rstest/core';
import { format, jq, tokenize } from '../worker-wasm/pkg';

rstest.mock('./helpers.ts', () => ({
  loadWasm: (file: string, imports: WebAssembly.Imports) => {
    expect(file).toBe('worker-core.wasm');
    return WebAssembly.instantiate(readFileSync('worker-core/worker-core.wasm'), imports);
  },
}));

describe.skip('worker-core.wasm', () => {
  beforeAll(() => {
    rstest.spyOn(console, 'log')
      .mockReturnValue();
  });

  afterAll(() => {
    rstest.resetAllMocks();
  });

  describe('tokenize', () => {
    test('should return a TokenizerResponse', async () => {
      const data = tokenize('{ "data": 123 }');

      expect(data).toEqual(tObject(tProperty('data', tNumber('123'))));
    });
  });

  describe('jq', () => {
    test('should return a TokenizerResponse', async () => {
      const data = jq({ json: '{ "data": 123 }', query: '.data' });

      expect(data).toEqual(tNumber('123'));
    });
  });

  describe('format', () => {
    test('should return a TokenizerResponse', async () => {
      const data = format('{ "data": 123 }');

      expect(data).toEqual('{\n    "data": 123\n}');
    });
  });
});
