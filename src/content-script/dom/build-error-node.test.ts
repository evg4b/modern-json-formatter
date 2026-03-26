import '@testing/browser.mock';
import '../ui/error-node/error-node';
import { buildErrorNode } from './build-error-node';
import { describe, expect, test } from '@rstest/core';

describe('error-node', () => {
  test('should create mjf-error-node element', () => {
    const node = buildErrorNode('Invalid json file.', 'Please check the file and try again.');

    expect(node.tagName.toLowerCase()).toBe('mjf-error-node');
    expect(node.header).toBe('Invalid json file.');
    expect(node.lines).toEqual(['Please check the file and try again.']);
  });

  test('should handle multiple lines', () => {
    const node = buildErrorNode('Error', 'Line one', 'Line two');

    expect(node.header).toBe('Error');
    expect(node.lines).toEqual(['Line one', 'Line two']);
  });

  test('should handle no lines', () => {
    const node = buildErrorNode('Error');

    expect(node.header).toBe('Error');
    expect(node.lines).toEqual([]);
  });
});
