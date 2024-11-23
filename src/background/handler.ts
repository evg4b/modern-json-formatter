import type { Message } from '@core/background';
import { jq } from '@packages/jq';
import { format, tokenize } from '@packages/tokenizer';
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

