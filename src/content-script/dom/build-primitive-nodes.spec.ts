import { describe, expect, it } from '@jest/globals';
import { buildStringNode } from './build-primitive-nodes';

describe('buildStringNode', () => {
  it('should create a URL string node', () => {
    const value = ' https://example.com ';
    const variant = 'url';

    const node = buildStringNode({ type: 'string', value, variant });

    expect(node).toMatchSnapshot();
  });

  it('should create an email string node', () => {
    const value = 'test@example.com';
    const variant = 'email';

    const node = buildStringNode({ type: 'string', value, variant });

    expect(node).toMatchSnapshot();
  });

  it('should create a default string node', () => {
    const value = 'default string';

    const node = buildStringNode({ type: 'string', value });

    expect(node).toMatchSnapshot();
  });
});
