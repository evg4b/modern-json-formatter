import { tArray, tBool, tNull, tNumber, tObject, tProperty, tString } from '@testing/json';
import { colon, toggle } from './elements';
import { buildInfoNode, isLinkElement, isToggleElement, isValueExpandable } from './helpers';
import { describe, expect, test } from '@rstest/core';

describe('dom helpers', () => {
  describe('isValueExpandable', () => {
    describe('should return true for', () => {
      const testCases = [
        {
          name: 'not empty object',
          value: tObject(tProperty('demo', tBool(true))),
        },
        {
          name: 'not empty array',
          value: tArray(tString('demo')),
        },
      ];
      test.each(testCases)('$name', ({ value }) => {
        expect(isValueExpandable(value)).toBe(true);
      });
    });

    describe('should return false for', () => {
      const testCases = [
        { name: 'null', value: tNull() },
        { name: 'boolean', value: tBool(true) },
        { name: 'string', value: tString('demo') },
        { name: 'number', value: tNumber('123') },
        { name: 'empty object', value: tObject() },
        { name: 'empty array', value: tArray() },
      ];
      test.each(testCases)('$name', ({ value }) => {
        expect(isValueExpandable(value)).toBe(false);
      });
    });
  });

  describe('isToggleElement', () => {
    test('should return true for toggle element', () => {
      expect(isToggleElement(toggle())).toBe(true);
    });
    test('should return false for non-toggle element', () => {
      expect(isToggleElement(colon())).toBe(false);
    });
    test('should return false for null', () => {
      expect(isToggleElement(null)).toBe(false);
    });
  });

  describe('isLinkElement', () => {
    test('should return true for url element', () => {
      const el = document.createElement('span');
      el.classList.add('url');
      expect(isLinkElement(el)).toBe(true);
    });

    test('should return true for email element', () => {
      const el = document.createElement('span');
      el.classList.add('email');
      expect(isLinkElement(el)).toBe(true);
    });

    test('should return false for non-link element', () => {
      expect(isLinkElement(colon())).toBe(false);
    });

    test('should return false for null', () => {
      expect(isLinkElement(null)).toBe(false);
    });
  });

  describe('buildInfoNode', () => {
    describe('should return null for', () => {
      const testCases = [
        { name: 'number node', node: tNumber('123') },
        { name: 'string node', node: tString('test') },
        { name: 'null node', node: tNull() },
        { name: 'boolean node', node: tBool(true) },
        { name: 'empty object node', node: tObject() },
        { name: 'empty array node', node: tArray() },
      ];
      test.each(testCases)('$name', ({ node }) => {
        const infoElement = buildInfoNode(node);

        expect(infoElement).toBeNull();
      });
    });

    describe('should return properties count element for', () => {
      test('object node', () => {
        const node = tObject(tProperty('demo', tBool(true)), tProperty('test', tString('demo')));
        const infoElement = buildInfoNode(node);

        expect(infoElement).toMatchSnapshot();
      });

      test('array node', () => {
        const node = tArray(tString('demo'), tString('test'));
        const infoElement = buildInfoNode(node);

        expect(infoElement).toMatchSnapshot();
      });
    });
  });
});
