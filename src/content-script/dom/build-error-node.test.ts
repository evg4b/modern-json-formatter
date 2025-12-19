import '@testing/browser.mock';
import { buildErrorNode } from './build-error-node';
import { describe, expect, test } from '@rstest/core';

describe('error-node', () => {
  test('should render error node', () => {
    const node = buildErrorNode('Invalid json file.', 'Please check the file and try again.');

    expect(node).toMatchSnapshot();
  });
});
