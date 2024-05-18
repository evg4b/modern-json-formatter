import { tArray, tBool, tNull, tNumber, tObject, tProperty, tString } from '../../testing';
import { colon, toggle } from './elements';
import { element, isToggleElement, isValueExpandable } from './helpres';

describe('dom helpers', () => {
  describe('isValueExpandable', () => {
    describe('should return true for', () => {
      const testCases = [
        {
          name: 'not empty object',
          value: tObject(
            tProperty('demo', tBool(true)),
          ),
        },
        {
          name: 'not empty array',
          value: tArray(
            tString('demo'),
          ),
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
  });

  describe('element', () => {
    test('should create element with content', () => {
      expect(element({ content: 'demo' })).toMatchSnapshot();
    });

    test('should create element with class', () => {
      expect(element({ class: 'demo' })).toMatchSnapshot();
    });

    test('should create element with content and class', () => {
      expect(element({ content: 'demo', class: 'demo' })).toMatchSnapshot();
    });
  });
});
