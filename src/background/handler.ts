import { createHandler } from '@core/background/protocol';
import { format, query, tokenize } from '@wasm';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';
import { download } from './download';

export const handler = createHandler({
  'tokenize': json => tokenize(json),
  'format': json => format(json),
  'jq': payload => query(payload.json, payload.query),
  'get-history': payload => getHistory(payload),
  'push-history': payload => pushHistory(payload),
  'clear-history': () => clearHistory(),
  'get-domains': () => getDomains(),
  'download': ({ type, content, filename }) => download(type, content, filename),
});
