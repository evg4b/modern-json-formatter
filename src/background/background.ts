import { type Message } from '@core/background/protocol';
import { handler } from './handler';

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse): unknown => {
  void handler(message).then(sendResponse);

  return true;
});
