import { type ErrorNode, type TokenizerResponse } from './models';
import { importWasm } from './wasm';

let go = new Go();

export * from './models';

export const jq = async (data: string, query: string): Promise<TokenizerResponse> => {
  if (!('___jq' in globalThis) || go.exited) {
    go = new Go();
    await importWasm(go, 'jq.wasm');
  }

  return globalThis.___jq(data, query);
};

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
};
