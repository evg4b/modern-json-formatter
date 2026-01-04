import { type DomainCountResponse, type HistoryResponse, type Message, type TokenizerResponse } from '@core/background';
import { type ErrorNode } from '@worker-core';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';
import { format, tokenize, jq } from '../../worker-wasm/pkg';

type HandlerResult = ErrorNode | TokenizerResponse | string | HistoryResponse | DomainCountResponse;

export const handler = async (message: Message): Promise<HandlerResult | void> => {
  try {
    switch (message.action) {
      case 'tokenize': {
        return tokenize(message.payload);
      }
      case 'format':
        return format(message.payload);
      case 'jq':
        return jq(message.payload.json, message.payload.query);
      case 'get-history':
        return await getHistory(message.payload);
      case 'push-history':
        return await pushHistory(message.payload);
      case 'clear-history':
        return await clearHistory();
      case 'get-domains':
        return await getDomains();
      default: {
        const type: string = message['action'] ?? 'N/A';

        return {
          type: 'error',
          scope: 'worker',
          error: `Unknown message type: ${type}`,
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
      error: `Unknown error: ${String(err)}`,
    };
  }
};
