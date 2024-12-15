import { type FormatParams } from '@core/background/models';
import { sendMessage } from '@core/browser';
import { type ErrorNode } from '@worker-core';

export const format = async (json: string): Promise<ErrorNode | string> => {
  return sendMessage<FormatParams, ErrorNode | string>({ action: 'format', json });
};
