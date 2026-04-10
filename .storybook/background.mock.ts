import type { TokenizerResponse } from '../worker-wasm/types/models';

export const jq = async (_json: string, _query: string): Promise<TokenizerResponse> => ({
  type: 'null',
});

export const getHistory = async (_hostname: string, _prefix: string): Promise<string[]> => [];

export const pushHistory = async () => {};

export const format = async (json: string): Promise<string> => json;

export const tokenize = async (_json: string): Promise<TokenizerResponse> => ({ type: 'null' });

export const download = async () => {};
