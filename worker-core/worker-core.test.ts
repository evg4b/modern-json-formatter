import '@testing/browser.mock';
import { readFileSync } from 'fs';
import { tNumber, tObject, tProperty } from '@testing';
import { tokenize, jq, format } from './index';

jest.mock('../shared/wasm_helpers.ts', () => ({
  loadWasm: (_: string, imports: WebAssembly.Imports) => {
    const data = readFileSync('worker-core/worker-core.wasm');
    return WebAssembly.instantiate(data, imports);
  },
}));

describe('tokenize', () => {
  test('should return a TokenizerResponse', async () => {
    const data = await tokenize('{"data":123}');

    expect(data).toEqual(tObject(tProperty('data', tNumber(`123`))));
  });
});

describe('jq', () => {
  test('should return a TokenizerResponse', async () => {
    const data = await jq('{ "data": 123 }', '.data');

    expect(data).toEqual(tNumber(`123`));
  });
});

describe('format', () => {
  test('should return a TokenizerResponse', async () => {
    const data = await format('{"data":123}');

    expect(data).toEqual(`tObject(tProperty('data', tNumber(123)))`);
  });
});
