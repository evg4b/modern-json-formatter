import type { Message, TokenizerResponse } from '@core/background';
import { ErrorNode, format, jq, tokenize } from '@worker-core';
import { is } from './helpres';

type HandlerResult = ErrorNode | TokenizerResponse | string;
export const handler = (message: Message): HandlerResult => {
  try {
    if (is(message, 'tokenize')) {
      return tokenize(message.json);
    } else if (is(message, 'format')) {
      return format(message.json);
    } else if (is(message, 'jq')) {
      return jq(message.json, message.query);
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

