import { importWasm } from '../shared';
import { ErrorNode, TokenizerResponse } from './models';

let go = new Go();

export const tokenize = async (data: string): Promise<TokenizerResponse> => {
  if (!('___tokenizeJSON' in globalThis) || go.exited) {
    go = new Go();
    await importWasm(go, 'tokenizer.wasm');
  }

  return globalThis.___tokenizeJSON(data);
};

export const format = async (data: string): Promise<ErrorNode | string> => {
  if (!('___formatJSON' in globalThis) || go.exited) {
    go = new Go();
    await importWasm(go, 'tokenizer.wasm');
  }

  return globalThis.___formatJSON(data);
}
