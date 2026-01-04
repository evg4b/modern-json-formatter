import { describe, expect, test } from '@rstest/core';
import { jq } from '../worker-wasm/pkg';
import { tNumber } from '@testing';

describe('demo', () => {
  test('jq', () => {
    const demp = jq('{ "demo": { "id": 123213 } }', '.demo.id');
    console.log(demp);
    expect(demp).toEqual({
      type: 'tuple',
      items: [tNumber('123213')],
    });
  });
});
