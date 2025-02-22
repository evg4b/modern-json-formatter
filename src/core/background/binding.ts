import { sendMessage } from '@core/browser';
import type { ErrorNode, TokenizerResponse } from '@worker-core';
import type {
  ClearHistoryParams,
  FormatParams,
  GetDomainsParams,
  GetHistoryParams,
  HistoryResponse,
  JqParams,
  PushHistoryParams,
  TokenizeParams,
} from './models';

const bridge = async <M, R>(request: M) => {
  const response = await sendMessage<M, R | ErrorNode>(request);
  if (typeof response === 'object' && response && 'type' in response && response.type === 'error') {
    return Promise.reject(response);
  }

  return response as R;
};

export const format = async (json: string): Promise<ErrorNode | string> => {
  return bridge<FormatParams, ErrorNode | string>({ action: 'format', json });
};

export const jq = async (json: string, query: string): Promise<TokenizerResponse> => {
  return bridge<JqParams, TokenizerResponse>({ action: 'jq', json, query });
};


export const tokenize = async (json: string): Promise<TokenizerResponse> => {
  return bridge<TokenizeParams, TokenizerResponse>({ action: 'tokenize', json });
};

export const getHistory = async (domain: string, prefix: string): Promise<HistoryResponse> => {
  return bridge<GetHistoryParams, HistoryResponse>({ action: 'get-history', domain, prefix });
};

export const clearHistory = async (domain: string): Promise<void> => {
  return bridge<ClearHistoryParams, void>({ action: 'clear-history', domain });
};

export const pushHistory = async (domain: string, query: string): Promise<void> => {
  return bridge<PushHistoryParams, void>({ action: 'push-history', domain, query });
};

export const getDomains = async (): Promise<string[]> => {
  return bridge<GetDomainsParams, string[]>({ action: 'get-domains' });
};
