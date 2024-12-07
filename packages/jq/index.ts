import { TokenizerResponse } from '@packages/tokenizer';
import { importWasm } from '../shared';

let go = new Go();

export const jq = async (data: string, query: string): Promise<TokenizerResponse> => {
  if (!('___jq' in globalThis) || go.exited) {
    go = new Go();
    await importWasm(go, 'jq.wasm');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return globalThis.___jq(data, query);
};
