import { type Message } from '@core/background';
import { initialize } from '@worker-core';
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

chrome.runtime.onInstalled.addListener(() => {
  void initialize()
    .then(() => console.log('Worker initialized'))
    .catch((err: Error) => console.error(err));
});
