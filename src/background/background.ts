import '../../worker-core/wasm_exec.js';
import { type Message } from '@core/background';
import { initialize } from '@worker-core';
import { handler } from './handler';

 
chrome.runtime.onMessage.addListener((message: Message, _, sendResponse): unknown => {
  sendResponse(handler(message));
  return true;
});

 
chrome.runtime.onInstalled.addListener(() => {
  void initialize()
    .then(() => console.log('Worker initialized'))
    .catch((err: Error) => console.error(err));
});
