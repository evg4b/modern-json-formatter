import { describe, expect, test } from '@rstest/core';
import { format, query, tokenize } from '@wasm';
import { tArray, tBool, tNull, tNumber, tObject, tProperty, tString, tTuple } from '@testing';

describe('worker-wasm', () => {
  describe('query', () => {
    const testCases = [
      {
        name: 'empty object',
        input: '{}',
        query: '.',
        expected: tObject(),
      },
      {
        name: 'empty array',
        input: '[]',
        query: '.',
        expected: tArray(),
      },
      {
        name: 'number',
        input: '123',
        query: '.',
        expected: tNumber('123'),
      },
      {
        name: 'json with comment',
        input: `
          // coment
          { "test": 123 }
        `,
        query: '.test',
        expected: tNumber('123'),
      },
      {
        name: 'unexisting property',
        input: `
          { "test": 123 }
        `,
        query: '.foo',
        expected: tNull(),
      },
    ];

    test.each(testCases)('$name', ({ input, query: jq, expected }) => {
      expect(query(input, jq)).toEqual(tTuple(
        ...Array.isArray(expected) ? expected : [expected],
      ));
    });

    test('query', () => {
      const actual = query('{ "demo": { "id": 123213 } }', '.demo.id');

      expect(actual).toEqual(tTuple(tNumber('123213')));
    });

    test('should return a TokenizerResponse', async () => {
      const data = query('{ "data": 123 }', '.data');

      expect(data).toEqual(tTuple(tNumber('123')));
    });
  });

  describe('tokenize', () => {
    const f64 = '179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632'
      + '766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868'
      + '508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368'
      + '.0000000000000000';

    const testCases = [
      {
        name: 'empty object',
        input: JSON.stringify({}),
        expected: tObject(),
      },
      {
        name: 'empty array',
        input: JSON.stringify([]),
        expected: tArray(),
      },
      {
        name: 'number',
        input: JSON.stringify(123),
        expected: tNumber('123'),
      },
      {
        name: 'negative number',
        input: JSON.stringify(-123),
        expected: tNumber('-123'),
      },
      {
        name: 'max int64 number',
        input: '9223372036854775807',
        expected: tNumber('9223372036854775807'),
      },
      {
        name: 'min int64 number',
        input: '-9223372036854775807',
        expected: tNumber('-9223372036854775807'),
      },
      {
        name: 'max short f64 number',
        input: '1.7976931348623157e308',
        expected: tNumber('1.7976931348623157e308'),
      },
      {
        name: 'min short uint64 number',
        input: '-1.7976931348623157e308',
        expected: tNumber('-1.7976931348623157e308'),
      },
      {
        name: 'min full f64 number',
        input: `-${f64}`,
        expected: tNumber(`-${f64}`),
      },
      {
        name: 'max full f64 number',
        input: f64,
        expected: tNumber(f64),
      },
      {
        name: 'null',
        input: JSON.stringify(null),
        expected: tNull(),
      },
      {
        name: 'string',
        input: JSON.stringify('test'),
        expected: tString('test'),
      },
      {
        name: 'http url string string',
        input: JSON.stringify('http://test.com'),
        expected: tString('http://test.com', 'url'),
      },
      {
        name: 'https url string string',
        input: JSON.stringify('https://test.com'),
        expected: tString('https://test.com', 'url'),
      },
      {
        name: 'ftp url string string',
        input: JSON.stringify('ftp://test.com'),
        expected: tString('ftp://test.com', 'url'),
      },
      {
        name: 'email string string',
        input: JSON.stringify('demo@mail.com'),
        expected: tString('demo@mail.com', 'email'),
      },
      {
        name: 'boolean',
        input: JSON.stringify(true),
        expected: tBool(true),
      },
    ];

    const expandCases = testCases.flatMap(({ name, expected, input }) => [
      { name, expected, input },
      {
        name: `${name} with nested object`,
        input: `{ "demo": ${input} }`,
        expected: tObject(tProperty('demo', expected)),
      },
      {
        name: `${name} with nested array`,
        input: `[ ${input} ]`,
        expected: tArray(expected),
      },
      {
        name: `${name} with spaces`,
        input: `     ${input}     `,
        expected,
      },
      {
        name: `${name} with tabs`,
        input: `\t\t\t${input}\t\t\t`,
        expected,
      },
      {
        name: `${name} with new lines`,
        input: `\n\n\n${input}\n\n\n`,
        expected,
      },
      {
        name: `${name} with mixed whitespace`,
        input: `\n\t \n \t\n${input}\n \t\n\n  \t   `,
        expected,
      },
    ]);

    test.each(expandCases)('$name', async ({ input, expected }) => {
      expect(tokenize(input)).toEqual(expected);
    });
  });

  describe.skip('format', () => {
    test('should return a TokenizerResponse', async () => {
      const data = format('{ "data": 123 }');

      expect(data).toEqual('{\n  "data": 123\n}');
    });
  });
});
