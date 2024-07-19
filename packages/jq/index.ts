import { importWasm } from '../shared';

const go = new Go();

export const jq = async (data: string, query: string): Promise<TokenizerResponse> => {
  if (!('___jq' in window)) {
    await importWasm(go, 'jq.wasm');
  }

  return window.___jq(data, query);
};
