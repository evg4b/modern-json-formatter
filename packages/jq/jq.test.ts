import '@testing/browser.mock';
import { tNumber } from '@testing/json';
import { readFileSync } from 'fs';
import { jq } from './index';

jest.mock('../shared/wasm_helpers.ts', () => ({
  loadWasm: (_: string, imports: WebAssembly.Imports) => {
    const data = readFileSync('packages/jq/jq.wasm');
    return WebAssembly.instantiate(data, imports);
  },
}));

describe('jq', () => {
  test('should return a TokenizerResponse', async () => {
    const data = await jq('{ "data": 123 }', '.data');

    expect(data).toEqual(tNumber(`123`));
  });
});
