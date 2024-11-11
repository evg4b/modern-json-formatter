import { TokenizerResponse } from '@packages/tokenizer';

export interface TokenizeParams {
  action: 'tokenize';
  json: string;
}

export interface JqParams {
  action: 'jq';
  json: string;
  query: string;
}

export type Message = TokenizeParams | JqParams;

export { TokenizerResponse };
