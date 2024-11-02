import '@testing/browser.mock';
import { readFileSync } from 'fs';
import { tNumber, tObject, tProperty } from '../../testing';
import { tokenize } from './index';

jest.mock('../shared/wasm_helpers.ts', () => ({
  loadWasm: (_: string, imports: WebAssembly.Imports) => {
    const data = readFileSync('packages/tokenizer/tokenizer.wasm');
    return WebAssembly.instantiate(data, imports);
  },
}));

describe('jq', () => {
  test('should return a TokenizerResponse', async () => {
    const data = await tokenize('{ "data": 123 }');

    expect(data).toEqual(tObject(tProperty('data', tNumber(`123`))));
  });
});
