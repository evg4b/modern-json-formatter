import { type JqParams } from '@core/background/models';
import { sendMessage } from '@core/browser';
import { type TokenizerResponse } from '@worker-core';

export const jq = async (json: string, query: string): Promise<TokenizerResponse> => {
  return sendMessage<JqParams, TokenizerResponse>({ action: 'jq', json, query });
};
