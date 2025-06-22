import '@testing/wasm';
import { describe, expect, test } from '@jest/globals';
import { format, jq, tokenize } from './index';
import { importWasm } from './wasm';

describe('worker-core', () => {
  const nonStringValues = [
    { name: 'null', value: null as unknown as string },
    { name: 'undefined', value: undefined as unknown as string },
    { name: 'non-void and not string value', value: ['xxx'] as unknown as string },
  ];

  describe('tokenize', () => {
    test.each(nonStringValues)('should throw error if input is $name', async ({ value }) => {
      await expect(tokenize(value))
        .rejects
        .toThrow('tokenize expects a string input');

      expect(importWasm).toHaveBeenCalled();
    });
  });

  describe('format', () => {
    test.each(nonStringValues)('should throw error if input is $name', async ({ value }) => {
      await expect(format(value))
        .rejects
        .toThrow('format expects a string input');
    });
  });

  describe('jq', () => {
    test.each(nonStringValues)('should throw error if json is $name', async ({ value }) => {
      await expect(jq({ json: value, query: 'key' }))
        .rejects
        .toThrow('jq expects a string input for json');
    });

    test.each(nonStringValues)('should throw error if query is $name', async ({ value }) => {
      await expect(jq({ json: '{}', query: value }))
        .rejects
        .toThrow('jq expects a string input for query');
    });
  });
});
