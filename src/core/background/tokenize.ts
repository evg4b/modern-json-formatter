import { type TokenizeParams } from '@core/background/models';
import { sendMessage } from '@core/browser';
import { type TokenizerResponse } from '@packages/tokenizer';

export const tokenize = async (json: string): Promise<TokenizerResponse> => {
  return sendMessage<TokenizeParams, TokenizerResponse>({ action: 'tokenize', json });
};
