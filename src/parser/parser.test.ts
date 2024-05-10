import { beforeAll } from '@jest/globals';
import fs from 'fs/promises';
import '../../parser/wasm_exec.js';

describe('parser wasm', () => {
  const go = new Go();

  beforeAll(async () => {
    const wasmBuffer = await fs.readFile('parser/parser.wasm');
    const wasm = await WebAssembly.instantiate(wasmBuffer, go.importObject);
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
      expect(actual).toEqual(tResponse(tNull()));
    });

    describe('boolean', () => {
      it('true', () => {
        const actual = parseJSON('true');
        expect(actual).toEqual(tResponse(tBool(true)));
      });

      it('false', () => {
        const actual = parseJSON('false');
        expect(actual).toEqual(tResponse(tBool(false)));
      });
    });

    describe('number', () => {
      describe('integer', () => {
        it('positive', () => {
          const actual = parseJSON('42');
          expect(actual).toEqual(tResponse(tNumber('42')));
        });

        it('negative', () => {
          const actual = parseJSON('-42');
          expect(actual).toEqual(tResponse(tNumber('-42')));
        });
      });

      describe('float', () => {
        it('positive', () => {
          const actual = parseJSON('42.42');
          expect(actual).toEqual(tResponse(tNumber('42.42')));
        });

        it('negative', () => {
          const actual = parseJSON('-42.42');
          expect(actual).toEqual(tResponse(tNumber('-42.42')));
        });
      });
    });

    describe('string', () => {
      it('empty', () => {
        const actual = parseJSON('""');
        expect(actual).toEqual(tResponse(tString('')));
      });

      it('non-empty', () => {
        const actual = parseJSON('"hello"');
        expect(actual).toEqual(tResponse(tString('hello')));
      });

      it('with escaped quotes', () => {
        const actual = parseJSON('"hello \\"world\\""');
        expect(actual).toEqual(tResponse(tString('hello "world"')));
      });

      it('with escaped backslashes', () => {
        const actual = parseJSON('"hello \\\\world"');
        expect(actual).toEqual(tResponse(tString('hello \\world')));
      });
    });
  });

  test('should parse JSON', () => {
    const actual = parseJSON('{"a": 1}');
    expect(actual).toEqual(tResponse(
      tObject([
        tProperty('a', tNumber('1')),
      ]),
    ));
  });

  test('should parse JSON with nested objects', () => {
    const actual = parseJSON('{"a": {"b": 2}}');
    expect(actual).toEqual(tResponse(
      tObject([
        tProperty('a', tObject([
          tProperty('b', tNumber('2')),
        ])),
      ]),
    ));
  });
});

const tNull = (): NullNode => ({ type: 'null' });
const tBool = (value: boolean): BooleanNode => ({ type: 'bool', value });
const tString = (value: string): StringNode => ({ type: 'string', value });
const tNumber = (value: string): NumberNode => ({ type: 'number', value });
const tArray = (items: ParsedJSON[]): ArrayNode => ({ type: 'array', items });
const tObject = (properties: PropertyNode[]): ObjectNode => ({ type: 'object', properties });
const tProperty = (key: string, value: ParsedJSON): PropertyNode => ({ key, value });
const tResponse = (value: ParsedJSON): SuccessParserResponse => ({ type: 'response', value });
