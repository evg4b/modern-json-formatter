import type { Message, TokenizerResponse } from '@core/background';
import { ErrorNode, format, jq, tokenize } from '@worker-core';
import { is } from './helpers';

type HandlerResult = ErrorNode | TokenizerResponse | string;
export const handler = async (message: Message): Promise<HandlerResult> => {
  try {
    if (is(message, 'tokenize')) {
      return await tokenize(message.json);
    } else if (is(message, 'format')) {
      return await format(message.json);
    } else if (is(message, 'jq')) {
      return await jq(message.json, message.query);
    }
  } catch (err: unknown) {
    return err instanceof Error
      ? {
        type: 'error',
        scope: 'worker',
        stack: err.stack,
        error: err.message,
      }
      : {
        type: 'error',
        scope: 'worker',
        error: `Unknown error: ${String(err)}`,
      };
  }

  return {
    type: 'error',
    scope: 'worker',
    error: 'Unknown message',
  } as ErrorNode;
};

