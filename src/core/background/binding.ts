import { sendMessage } from '@core/browser';
import { createClient, type DomainCount, type DownloadType } from './protocol';
import type { TokenNode, TupleNode } from '@wasm/types';

const request = createClient(message => sendMessage(message));

export const format = (json: string): Promise<string> => request('format', json);

export const jq = (json: string, query: string): Promise<TupleNode> => request('jq', { json, query });

export const tokenize = (json: string): Promise<TokenNode> => request('tokenize', json);

export const getHistory = (domain: string, prefix: string): Promise<string[]> => request('get-history', { domain, prefix });

export const clearHistory = (): Promise<void> => request('clear-history', undefined);

export const pushHistory = (domain: string, query: string): Promise<void> => request('push-history', { domain, query });

export const getDomains = (): Promise<DomainCount[]> => request('get-domains', undefined);

export const download = (type: DownloadType, content: string, filename: string): Promise<void> => {
  return request('download', { type, content, filename });
};
