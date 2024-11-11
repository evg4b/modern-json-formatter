import '../../packages/wasm_exec.js';
import { JqParams, TokenizeParams } from '@core/background';
import { jq } from '@packages/jq';
import { tokenize } from '@packages/tokenizer';

chrome.runtime.onMessage.addListener(function (message: TokenizeParams | JqParams, _, sendResponse) {
  if (message.action == 'tokenize') {
    tokenize(message.json).then(sendResponse);
    return true;
  }

  if (message.action == 'jq') {
    jq(message.json, message.query).then(sendResponse);
    return true;
  }
});
