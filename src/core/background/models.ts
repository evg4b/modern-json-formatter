import type { format, jq, tokenize } from '@worker-core';
import type { getDomains, getHistory, pushHistory } from '../../background/history';
import { clearHistory, type DomainCount } from '../../background/history';

export { type TokenizerResponse } from '@worker-core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload<T extends (...args: any) => any> = Parameters<T>[0];

export interface TokenizeParams {
  action: 'tokenize';
  payload: Payload<typeof tokenize>;
}

export interface FormatParams {
  action: 'format';
  payload: Payload<typeof format>;
}

export interface JqParams {
  action: 'jq';
  payload: Payload<typeof jq>;
}

export interface GetHistoryParams {
  action: 'get-history';
  payload: Payload<typeof getHistory>;
}

export type HistoryResponse = string[];
export type DomainCountResponse = DomainCount[];

export interface PushHistoryParams {
  action: 'push-history';
  payload: Payload<typeof pushHistory>;
}

export interface ClearHistoryParams {
  action: 'clear-history';
  payload: Payload<typeof clearHistory>;
}

export interface GetDomainsParams {
  action: 'get-domains';
  payload: Payload<typeof getDomains>;
}

export type Message
  = TokenizeParams
    | JqParams
    | FormatParams
    | GetHistoryParams
    | PushHistoryParams
    | ClearHistoryParams
    | GetDomainsParams;
