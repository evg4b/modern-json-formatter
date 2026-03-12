import { type DomainCountResponse, type HistoryResponse, type Message, type TokenizerResponse } from '@core/background';
import { type ErrorNode } from '@wasm/types';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';
import { download } from './download';
import { format, tokenize, query } from '@wasm';

type HandlerResult = ErrorNode | TokenizerResponse | string | HistoryResponse | DomainCountResponse;

export const handler = async (message: Message): Promise<HandlerResult | void> => {
  try {
    switch (message.action) {
      case 'tokenize': {
        return await tokenize(message.payload);
      }
      case 'format':
        return await format(message.payload);
      case 'jq':
        return await query(message.payload.json, message.payload.query);
      case 'get-history':
        return await getHistory(message.payload);
      case 'push-history':
        return await pushHistory(message.payload);
      case 'clear-history':
        return await clearHistory();
      case 'get-domains':
        return await getDomains();
      case 'download': {
        const { type, filename, content } = message.payload;
        return await download(type, content, filename);
      }
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
    const scope: ErrorNode['scope'] = ['tokenize', 'format'].includes(message.action)
      ? 'tokenizer'
      : message.action === 'jq'
        ? 'jq'
        : 'worker';

    if (err instanceof Error) {
      return {
        type: 'error',
        scope,
        stack: err.stack,
        error: err.message,
      };
    }

    return {
      type: 'error',
      scope,
      error: `Unknown error: ${String(err)}`,
    };
  }
};
