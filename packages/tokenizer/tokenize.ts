import { importWasm } from '../shared';
import { TokenizerResponse } from './models';

let go = new Go();

export const tokenize = async (data: string): Promise<TokenizerResponse> => {
  if (!('___tokenizeJSON' in window) || go.exited) {
    go = new Go();
    await importWasm(go, 'tokenizer.wasm');
  }

  return window.___tokenizeJSON(data);
};
