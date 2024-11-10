import { trim } from '@core/helpers';
import { describe } from '@jest/globals';

describe('trim', () => {
  const items = [
    { input: ' \tabc \t', chars: ' ', expected: '\tabc \t' },
    { input: ' \tabc\t ', chars: ' ', expected: '\tabc\t' },
    { input: ' \tabc \t', chars: ' \t', expected: 'abc' },
    { input: ' \t\r\nabc\t\r\n ', chars: ' \t\n\r', expected: 'abc' },
  ];

  it.each(items)('should return %p', ({ input, chars, expected }) => {
    expect(trim(input, chars)).toEqual(expected);
  });
});
