import { importWasm } from '../shared';

let go = new Go();

export const jq = async (data: string, query: string): Promise<TokenizerResponse> => {
  if (!('___jq' in window) || go.exited) {
    go = new Go();
    await importWasm(go, 'jq.wasm');
  }

  return window.___jq(data, query);
};
