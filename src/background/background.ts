import { type Message } from '@core/background';
import { handler } from './handler';

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse): unknown => {
  void handler(message)
    .then(sendResponse)
    .catch((err: Error) => sendResponse({
      type: 'error',
      scope: 'worker',
      stack: err.stack,
      error: err.message,
    }));

  return true;
});
