import { JqParams } from '@core/background/models';
import { sendMessage } from '@core/browser';
import { TokenizerResponse } from '@packages/tokenizer';

export const jq = async (json: string, query: string): Promise<TokenizerResponse> => {
  return sendMessage<JqParams, TokenizerResponse>({ action: 'jq', json, query });
};

