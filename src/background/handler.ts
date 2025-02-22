import type { HistoryResponse, Message, TokenizerResponse } from '@core/background';
import { ErrorNode, format, jq, tokenize } from '@worker-core';
import { is } from './helpers';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';

type HandlerResult = ErrorNode | TokenizerResponse | string | HistoryResponse;
export const handler = async (message: Message): Promise<HandlerResult | void> => {
  try {
    if (is(message, 'tokenize')) {
      return await tokenize(message.json);
    }

    if (is(message, 'format')) {
      return await format(message.json);
    }

    if (is(message, 'jq')) {
      return await jq(message.json, message.query);
    }

    if (is(message, 'get-history')) {
      return await getHistory(message.domain, message.prefix);
    }

    if (is(message, 'push-history')) {
      return await pushHistory(message.domain, message.query);
    }

    if (is(message, 'clear-history')) {
      return await clearHistory();
    }

    if (is(message, 'get-domains')) {
      return await getDomains();
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
        error: `Unknown error: ${ String(err) }`,
      };
  }

  return {
    type: 'error',
    scope: 'worker',
    error: 'Unknown message',
  } as ErrorNode;
};

