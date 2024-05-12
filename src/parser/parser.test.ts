import './polifills';
import fs from 'fs/promises';
import '../../parser/wasm_exec.js';

describe('parser wasm', () => {
  let go: Go;

  interface TestCase {
    name: string;
    input: string;
    expected: ParsedJSON;
  }

  const tNull = (): NullNode => ({ type: 'null' });
  const tBool = (value: boolean): BooleanNode => ({ type: 'bool', value: value });
  const tString = (value: string): StringNode => ({ type: 'string', value: value });
  const tNumber = (value: string): NumberNode => ({ type: 'number', value: value });
  const tArray = (items: ParsedJSON[]): ArrayNode => ({ type: 'array', items });
  const tObject = (properties: PropertyNode[]): ObjectNode => ({ type: 'object', properties });
  const tProperty = (key: string, value: ParsedJSON): PropertyNode => ({ key, value: value });
  const tResponse = (value: ParsedJSON): SuccessParserResponse => ({ type: 'response', value: value });

  const runTestCases = (testCases: TestCase[]) => {
    testCases.forEach(({ name, input, expected }) => {
      it(name, () => {
        const actual = parseJSON(input);
        expect(actual).toEqual(tResponse(expected));
      });
    });
  };

  beforeAll(async () => {
    const wasmBuffer = await fs.readFile('parser/parser.wasm');
    const wasm = await WebAssembly.instantiate(wasmBuffer, go.importObject);
    go = new Go();
    go.run(wasm.instance);
  });

  afterAll(() => {
    go.exit(0);
  });

  test('exported function should be defined', () => {
    expect(parseJSON).toBeDefined();
  });

  describe('primitives', () => {
    it('null', () => {
      const actual = parseJSON('null');
      expect(actual).toEqual(
        tResponse(tNull()),
      );
    });

    describe('boolean', () => {
      runTestCases([
        { name: 'true', input: 'true', expected: tBool(true) },
        { name: 'false', input: 'false', expected: tBool(false) },
      ]);
    });

    describe('number', () => {
      describe('integer', () => {
        runTestCases([
          { name: 'positive', input: '42', expected: tNumber('42') },
          { name: 'negative', input: '-42', expected: tNumber('-42') },
        ]);
      });

      describe('float', () => {
        runTestCases([
          { name: 'positive', input: '42.42', expected: tNumber('42.42') },
          { name: 'negative', input: '-42.42', expected: tNumber('-42.42') },
          { name: 'maximum js value + 1', input: '23064690611454417', expected: tNumber('23064690611454417') },
        ]);

        describe('integers', () => {
          runTestCases([
            { name: 'MaxInt8', input: '127', expected: tNumber('127') },
            { name: 'MinInt8', input: '-128', expected: tNumber('-128') },
            { name: 'MaxInt16', input: '32767', expected: tNumber('32767') },
            { name: 'MinInt16', input: '-32768', expected: tNumber('-32768') },
            { name: 'MaxInt32', input: '2147483647', expected: tNumber('2147483647') },
            { name: 'MinInt32', input: '-2147483648', expected: tNumber('-2147483648') },
            { name: 'MaxInt64', input: '9223372036854775807', expected: tNumber('9223372036854775807') },
            { name: 'MinInt64', input: '-9223372036854775808', expected: tNumber('-9223372036854775808') },
          ]);
        });

        describe('unsigned integers', () => {
          runTestCases([
            { name: 'MaxUint8', input: '255', expected: tNumber('255') },
            { name: 'MaxUint16', input: '65535', expected: tNumber('65535') },
            { name: 'MaxUint32', input: '4294967295', expected: tNumber('4294967295') },
            { name: 'MaxUint64', input: '18446744073709551615', expected: tNumber('18446744073709551615') },
          ]);
        });
      });
    });

    describe('string', () => {
      runTestCases([
        { name: 'empty', input: '""', expected: tString('') },
        { name: 'non-empty', input: '"hello"', expected: tString('hello') },
        { name: 'with escaped quotes', input: '"hello \\"world\\""', expected: tString('hello "world"') },
        { name: 'with escaped backslashes', input: '"hello \\\\world"', expected: tString('hello \\world') },
      ]);
    });
  });

  runTestCases([
    { name: 'should parse empty array', input: '[]', expected: tArray([]) },
    { name: 'should parse empty object', input: '{}', expected: tObject([]) },
    {
      name: 'should parse JSON',
      input: '{"a": 1}',
      expected:
        tObject([
          tProperty('a', tNumber('1')),
        ]),
    },
    {
      name: 'should parse JSON with nested objects',
      input: '{"a": {"b": 2}}',
      expected:
        tObject([
          tProperty('a', tObject([
            tProperty('b', tNumber('2')),
          ])),
        ]),
    },
    {
      name: 'should parse JSON with arrays',
      input: '[1, 2, 3]',
      expected:
        tArray([
          tNumber('1'),
          tNumber('2'),
          tNumber('3'),
        ]),
    },
  ]);
});
