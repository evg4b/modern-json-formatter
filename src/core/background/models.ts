import { DomainCount } from '../../background/history';

export { type TokenizerResponse } from '@worker-core';

export interface TokenizeParams {
  action: 'tokenize';
  json: string;
}

export interface FormatParams {
  action: 'format';
  json: string;
}

export interface JqParams {
  action: 'jq';
  json: string;
  query: string;
}

export interface GetHistoryParams {
  action: 'get-history';
  domain: string;
  prefix: string;
}

export type HistoryResponse = string[];
export type DomainCountResponse = DomainCount[];

export interface PushHistoryParams {
  action: 'push-history';
  domain: string;
  query: string;
}

export interface ClearHistoryParams {
  action: 'clear-history';
}

export interface GetDomainsParams {
  action: 'get-domains';
}

export type Message =
  TokenizeParams
  | JqParams
  | FormatParams
  | GetHistoryParams
  | PushHistoryParams
  | ClearHistoryParams
  | GetDomainsParams;


