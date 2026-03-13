const { getURL, sendMessage: chromeSendMessage } = chrome.runtime;
const resource = getURL;

export const sendMessage = chromeSendMessage as <M = unknown, R = unknown>(message: M) => Promise<R>;

export { resource };
