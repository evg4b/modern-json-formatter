import { describe, expect, test } from '@rstest/core';
import { format, jq, tokenize } from '../worker-wasm/pkg';

describe('demo', () => {
  test('jq', () => {
    const demp = jq('Hello ', 'word!');
    expect(demp).toEqual('Hello word!');
  });

  test('format', () => {
    expect(format('Hello {name}!')).toEqual('Hello {name}!');
  });

  test('tokenize', () => {
    expect(tokenize('Hello {name}!')).toEqual('tokenize');
  });
});
