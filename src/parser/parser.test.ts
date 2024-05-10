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

  test('should parse JSON', () => {
    const actual = parseJSON('{"a": 1}');
    expect(actual).toEqual({
      type: 'response',
      value: {
        type: 'object',
        properties: [
          { key: 'a', value: { type: 'number', value: '1' } },
        ],
      },
    });
  });

  test('should parse JSON with nested objects', () => {
    const actual = parseJSON('{"a": {"b": 2}}');
    expect(actual).toEqual({
      type: 'response',
      value: {
        type: 'object',
        properties: [
          {
            key: 'a',
            value: {
              type: 'object',
              properties: [
                { key: 'b', value: { type: 'number', value: '2' } },
              ],
            },
          },
        ],
      },
    });
  });
});



