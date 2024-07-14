import { importWasm } from '../shared';

const go = new Go();

export const tokenize = async (data: string): Promise<TokenizerResponse> => {
  if (!('___tokenizeJSON' in window)) {
    await importWasm(go, 'tokenizer.wasm');
  }

  return window.___tokenizeJSON(data);
};
