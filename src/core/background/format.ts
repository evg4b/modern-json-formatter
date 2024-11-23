import { FormatParams, type TokenizeParams } from '@core/background/models';
import { sendMessage } from '@core/browser';
import { ErrorNode, type TokenizerResponse } from '@packages/tokenizer';

export const format = async (json: string): Promise<ErrorNode | string> => {
  return sendMessage<FormatParams, ErrorNode | string>({ action: 'format', json });
};
