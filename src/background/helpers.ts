import {
  ClearHistoryParams,
  FormatParams,
  GetDomainsParams,
  GetHistoryParams,
  JqParams,
  Message,
  PushHistoryParams,
  TokenizeParams,
} from '@core/background';

interface Types {
  'jq': JqParams;
  'tokenize': TokenizeParams;
  'format': FormatParams;
  'get-history': GetHistoryParams;
  'push-history': PushHistoryParams;
  'clear-history': ClearHistoryParams;
  'get-domains': GetDomainsParams;
}

export const is = <T extends Message['action']>(message: object, type: T): message is Types[T] => {
  return 'action' in message && message.action == type;
};

export const wait = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
