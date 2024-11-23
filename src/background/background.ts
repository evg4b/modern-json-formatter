import '../../packages/wasm_exec.js';
import { type Message } from '@core/background';
import { handler } from './handler';

// eslint-disable-next-line @typescript-eslint/no-deprecated
chrome.runtime.onMessage.addListener(function (message: Message, _, sendResponse): boolean {
  handler(message, sendResponse)
    .catch((err: Error) => sendResponse({
      type: 'error',
      scope: 'worker',
      stack: err.stack,
      error: err.message,
    }));

  return true;
});
