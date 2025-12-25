import { describe, expect, test } from '@rstest/core';
import { buildStringNode } from './build-primitive-nodes';

describe('buildStringNode', () => {
  test('should create a URL string node', () => {
    const value = ' https://example.com ';
    const variant = 'url';

    const node = buildStringNode({ type: 'string', value, variant });

    expect(node).toMatchSnapshot();
  });

  test('should create an email string node', () => {
    const value = 'test@example.com';
    const variant = 'email';

    const node = buildStringNode({ type: 'string', value, variant });

    expect(node).toMatchSnapshot();
  });

  test('should create a default string node', () => {
    const value = 'default string';

    const node = buildStringNode({ type: 'string', value });

    expect(node).toMatchSnapshot();
  });
});
