import { createElement } from '@core/dom';
import { beforeEach, describe, expect, test } from '@rstest/core';
import { assetTabType, extractFileName, query, throws } from './helpers';

describe('helpers', () => {
  test('should work', () => {
    expect(() => throws()).toThrow('Unexpected value');
  });

  test('should work with a value', () => {
    expect(() => throws('Custom message')).toThrow('Custom message');
  });
});

describe('assetTabType', () => {
  const validCases = [
    'raw',
    'query',
    'formatted',
    null,
    undefined,
  ];

  test.each(validCases)('should not throw an error for valid tab type %s', tabType => {
    expect(() => assetTabType(tabType)).not.toThrow();
  });

  test('should throw an error for invalid tab type %s', () => {
    expect(() => assetTabType('invalid')).toThrow('Invalid tab type \'invalid\'');
  });
});

describe('throws', () => {
  const cases = [
    { value: undefined, expected: 'Unexpected value' },
    { value: 'Custom error', expected: 'Custom error' },
  ];

  test.each(cases)('should throw error with message $expected', ({ value, expected }) => {
    expect(() => throws(value)).toThrow(expected);
  });
});

describe('query', () => {
  let container: HTMLElement;
  let element: HTMLElement;

  beforeEach(() => {
    element = createElement({
      element: 'div',
      class: 'test-element',
      content: 'Test',
    });

    container = createElement({
      element: 'div',
      children: [element],
    });
  });

  test('should query element with selector .test-element', () => {
    expect(query(container, '.test-element')).toBe(element);
  });

  test('should throw error if element not found', () => {
    expect(() => query(container, '.non-existent-element')).toThrow('Element .non-existent-element not found');
  });
});

describe('extractFileName', () => {
  const cases = [
    { input: 'https://api.github.com/repos/evg4b/modern-json-formatter', expected: 'modern-json-formatter' },
    { input: 'https://api.github.com/repos/evg4b/modern-json-formatter.json', expected: 'modern-json-formatter' },
    { input: 'https://api.github.com/', expected: 'api-github-com' },
    { input: null, expected: 'data' },
    { input: undefined, expected: 'data' },
    { input: '', expected: 'data' },
  ];

  test.each(cases)('should extract file name from url', ({ input, expected }) => {
    const result = extractFileName(input);

    expect(result).toEqual(expected);
  });
});
