import { type ErrorNode, type TokenizerResponse } from './models';
import { importWasm } from './wasm';

let go = new Go();

export * from './models';

export const initialize = async (): Promise<void> => {
  go = new Go();
  await importWasm(go, 'worker-core.wasm');
};

const initIfNotDefined = async (key: string): Promise<void> => {
  if (!Reflect.get(globalThis, key)) {
    await initialize();
  }
}

export const jq = async (data: string, query: string): Promise<TokenizerResponse> => {
  await initIfNotDefined('___jq');
  return globalThis.___jq(data, query);
};

export const tokenize = async (data: string): Promise<TokenizerResponse> => {
  await initIfNotDefined('___tokenizeJSON');
  return globalThis.___tokenizeJSON(data);
};

export const format = async (data: string): Promise<ErrorNode | string> => {
  await initIfNotDefined('___tokenizeJSON');
  return globalThis.___formatJSON(data);
};
