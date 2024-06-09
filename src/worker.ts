import { jq } from '@evg4b/jq-wasm';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  jq(request.json, request.filter)
    .then((response: any) => sendResponse({ response }))
    .catch((err: any) => sendResponse({ error: err.message }));
  return true;
});
