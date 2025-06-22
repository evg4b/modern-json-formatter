import { DomainCountResponse, HistoryResponse, Message, TokenizerResponse } from '@core/background';
import { ErrorNode, format, jq, tokenize } from '@worker-core';
import { get } from 'lodash';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';

type HandlerResult = ErrorNode | TokenizerResponse | string | HistoryResponse | DomainCountResponse;

export const handler = async (message: Message): Promise<HandlerResult | void> => {
  try {
    switch (message.action) {
      case 'tokenize':
        return await tokenize(message.payload);
      case 'format':
        return await format(message.payload);
      case 'jq':
        return await jq(message.payload);
      case 'get-history':
        return await getHistory(message.payload);
      case 'push-history':
        return await pushHistory(message.payload);
      case 'clear-history':
        return await clearHistory();
      case 'get-domains':
        return await getDomains();
      default: {
        const type: string = get(message, 'action', 'N/A');

        return {
          type: 'error',
          scope: 'worker',
          error: `Unknown message type: ${ type }`,
        };
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        type: 'error',
        scope: 'worker',
        stack: err.stack,
        error: err.message,
      };
    }

    return {
      type: 'error',
      scope: 'worker',
      error: `Unknown error: ${ String(err) }`,
    };
  }
};

