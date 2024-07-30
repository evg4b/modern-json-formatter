import { readFileSync } from 'fs';
import { chromeMockAfter, chromeMockBefore, tNumber } from '../../testing';
import { jq } from './index';

jest.mock('../shared/wasm_helpers.ts', () => ({
  loadWasm: (_: string, imports: any) => {
    const data = readFileSync('packages/jq/jq.wasm');
    return WebAssembly.instantiate(data, imports);
  },
}));

describe('jq', () => {
  beforeAll(chromeMockBefore);

  afterAll(chromeMockAfter);

  test('should return a TokenizerResponse', async () => {
    const data = await jq('{ "data": 123 }', '.data');

    expect(data).toEqual(tNumber(`123`));
  });
});
