import type { Message } from '@core/background';
import { jq } from '@worker-core';
import { format, tokenize } from '@worker-core';
import { is } from './helpres';

export const handler = async (message: Message, sendResponse: (resp: unknown) => void): Promise<void> => {
  if (is(message, 'tokenize')) {
    await tokenize(message.json)
      .then(sendResponse);
  } else if (is(message, 'format')) {
    await format(message.json)
      .then(sendResponse);
  } else if (is(message, 'jq')) {
    await jq(message.json, message.query)
      .then(sendResponse);
  }
};

