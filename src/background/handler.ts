import { createHandler } from '@core/background/protocol';
import { format, query, tokenize } from '@wasm';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';
import { download } from './download';

export const handler = createHandler({
  'tokenize': json => tokenize(json),
  'format': json => format(json),
  'jq': async ({ json, query: expression, url }) => {
    const result = query(json, expression);
    if (url) {
      try {
        await pushHistory({ url, query: expression });
      } catch (error: unknown) {
        console.error('Unable to save query history', error);
      }
    }

    return result;
  },
  'get-history': payload => getHistory(payload),
  'clear-history': () => clearHistory(),
  'get-domains': () => getDomains(),
  'download': ({ type, content, filename }) => download(type, content, filename),
});
