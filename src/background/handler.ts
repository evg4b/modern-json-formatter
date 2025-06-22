import { DomainCountResponse, HistoryResponse, Message, TokenizerResponse } from '@core/background';
import { ErrorNode, format, jq, tokenize } from '@worker-core';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';

type HandlerResult = ErrorNode | TokenizerResponse | string | HistoryResponse | DomainCountResponse;

function handle(message: Message) {
  switch (message.action) {
    case 'tokenize':
      return tokenize(message.json);
    case 'format':
      return format(message.json);
    case 'jq':
      return jq(message.json, message.query);
    case 'get-history':
      return getHistory(message.domain, message.prefix);
    case 'push-history':
      return pushHistory(message.domain, message.query);
    case 'clear-history':
      return clearHistory();
    case 'get-domains':
      return getDomains();
    default:
      return {
        type: 'error',
        scope: 'worker',
        error: `Unknown message type: ${ (Reflect.get(message, 'action') as (string | undefined) ?? 'N/A') }`,
      } as ErrorNode;
  }
}

export const handler = async (message: Message): Promise<HandlerResult | void> => {
  try {
    return await handle(message);
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
};

