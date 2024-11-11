import '../../packages/wasm_exec.js';
import { JqParams, TokenizeParams } from '@core/background';
import { jq } from '@packages/jq';
import { tokenize } from '@packages/tokenizer';
import { is } from './helpres';

// eslint-disable-next-line @typescript-eslint/no-deprecated
chrome.runtime.onMessage.addListener(function (message: TokenizeParams | JqParams | object, _, sendResponse) {
  if (is(message, 'tokenize')) {
    tokenize(message.json)
      .then(sendResponse)
      .catch((err: unknown) => console.error(err));

    return true;
  }

  if (is(message, 'jq')) {
    jq(message.json, message.query)
      .then(sendResponse)
      .catch((err: unknown) => console.error(err));

    return true;
  }
});
