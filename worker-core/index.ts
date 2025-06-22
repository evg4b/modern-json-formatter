import { isString } from 'typed-assert';
import { type ErrorNode, type TokenizerResponse } from './models';
import { importWasm } from './wasm';

let go = new Go();

export * from './models';

export const initialize = async (): Promise<void> => {
  go = new Go();
  await importWasm(go, 'worker-core.wasm');
  console.log('Wasm runtime initialized');
};

const initIfNotDefined = async (key: string): Promise<void> => {
  if (!Reflect.get(globalThis, key)) {
    await initialize();
  }
};

export const jq = async ({ json, query }: { json: string; query: string }) => {
  await initIfNotDefined('___jq');
  isString(json, 'jq expects a string input for json');
  isString(query, 'jq expects a string input for query');
  return globalThis.___jq(json, query);
};

export const tokenize = async (data: string): Promise<TokenizerResponse> => {
  await initIfNotDefined('___tokenizeJSON');
  isString(data, 'tokenize expects a string input');
  return globalThis.___tokenizeJSON(data);
};

export const format = async (data: string): Promise<ErrorNode | string> => {
  await initIfNotDefined('___formatJSON');
  isString(data, 'format expects a string input');
  return globalThis.___formatJSON(data);
};
