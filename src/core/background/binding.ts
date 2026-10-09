import { sendMessage } from '@core/browser';
import { createClient, type DomainCount, type DownloadType } from './protocol';
import type { TokenNode, TupleNode } from '@wasm/types';

const request = createClient(message => sendMessage(message));

export const format = (json: string): Promise<string> => request('format', json);

export const jq = (json: string, query: string, url?: string): Promise<TupleNode> => request('jq', { json, query, url });

export const tokenize = (json: string): Promise<TokenNode> => request('tokenize', json);

export const getHistory = (url: string, prefix: string): Promise<string[]> => request('get-history', { url, prefix });

export const clearHistory = (): Promise<void> => request('clear-history', undefined);

export const getDomains = (): Promise<DomainCount[]> => request('get-domains', undefined);

export const download = (type: DownloadType, content: string, filename: string): Promise<void> => {
  return request('download', { type, content, filename });
};
