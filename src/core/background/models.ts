import { type TokenizerResponse } from '@worker-core';

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

export type Message = TokenizeParams | JqParams | FormatParams;

export { TokenizerResponse };
