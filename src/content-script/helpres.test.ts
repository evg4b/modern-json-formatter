import { describe, test } from '@jest/globals';
import { isNotNil, throws } from './helpres';

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

  test.each(cases)(`should return $value for $expected`, ({ value, expected }) => {
    expect(isNotNil(value)).toBe(expected);
  });
})
