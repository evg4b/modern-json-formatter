import { createElement } from '@core/dom';
import { beforeEach, describe, expect, test } from '@rstest/core';
import { tArray, tBool, tErrorNode, tNull, tNumber, tObject, tProperty, tString } from '@testing';
import { type ErrorNode } from '@worker-core';
import { assetTabType, isErrorNode, isNotNil, query, throws } from './helpers';

describe('helpers', () => {
  test('should work', () => {
    expect(() => throws()).toThrow('Unexpected value');
  });

  test('should work with a value', () => {
    expect(() => throws('Custom message')).toThrow('Custom message');
  });
});

describe('isNotNil', () => {
  const cases = [
    { value: null, expected: false },
    { value: undefined, expected: false },
    { value: 0, expected: true },
    { value: '', expected: true },
    { value: 'string', expected: true },
    { value: [], expected: true },
    { value: {}, expected: true },
  ];

  test.each(cases)('should return $value for $expected', ({ value, expected }) => {
    expect(isNotNil(value)).toBe(expected);
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

describe('isErrorNode', () => {
  test('should return true for ErrorNode', () => {
    const errorNode: ErrorNode = tErrorNode('error message');
    expect(isErrorNode(errorNode)).toBe(true);
  });

  describe('should return false for non-ErrorNode objects', () => {
    const cases = [
      { name: 'empty object', value: {} },
      { name: 'null node', value: tNull() },
      { name: 'boolean node', value: tBool(true) },
      { name: 'string node', value: tString('string') },
      { name: 'number node', value: tNumber('123') },
      { name: 'empty array node', value: tArray() },
      {
        name: 'filed array node',
        value: tArray(tNumber('1')),
      },
      {
        name: 'object node',
        value: tObject(
          tProperty('prop', tNumber('1')),
        ),
      },
    ];

    test.each(cases)('$name', ({ value }) => {
      expect(isErrorNode(value)).toBe(false);
    });
  });

  describe('should return false for non-object values', () => {
    const cases = [
      { name: 'null', value: null },
      { name: 'undefined', value: undefined },
      { name: 'string', value: 'string' },
      { name: 'number', value: 123 },
      { name: 'boolean', value: true },
    ];

    test.each(cases)('$name', ({ value }) => {
      expect(isErrorNode(value)).toBe(false);
    });
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
