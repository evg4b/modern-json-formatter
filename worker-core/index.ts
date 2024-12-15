import { type ErrorNode, type TokenizerResponse } from './models';
import { importWasm } from './wasm';

const go = new Go();

export * from './models';

export const initialize = async (): Promise<void> => {
  await importWasm(go, 'worker-core.wasm');
};

export const jq = (data: string, query: string): TokenizerResponse => {
  return globalThis.___jq(data, query);
};

export const tokenize = (data: string): TokenizerResponse => {
  return globalThis.___tokenizeJSON(data);
};

export const format = (data: string): ErrorNode | string => {
  return globalThis.___formatJSON(data);
};
