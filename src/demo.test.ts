import { describe, expect, test } from '@rstest/core';
import { format, jq, tokenize } from '@wasm';
import { tNumber, tObject, tProperty, tTuple } from '@testing';

describe('demo', () => {
  test('jq', () => {
    const actual = jq('{ "demo": { "id": 123213 } }', '.demo.id');

    expect(actual).toEqual({
      type: 'tuple',
      items: [tNumber('123213')],
    });
  });
});

describe('worker-wasm', () => {
  describe('tokenize', () => {
    test('should return a TokenizerResponse', async () => {
      const data = tokenize('{ "data": 123 }');

      expect(data).toEqual(tObject(tProperty('data', tNumber('123'))));
    });
  });

  describe('jq', () => {
    test('should return a TokenizerResponse', async () => {
      const data = jq('{ "data": 123 }', '.data');

      expect(data).toEqual(tTuple([tNumber('123')]));
    });
  });

  describe('format', () => {
    test('should return a TokenizerResponse', async () => {
      const data = format('{ "data": 123 }');

      expect(data).toEqual('{\n  "data": 123\n}');
    });
  });
});
