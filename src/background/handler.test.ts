const formatMock = jest.fn();
const tokenizeMock = jest.fn();
const jqMock = jest.fn();

jest.mock('@packages/jq', () => ({ jq: jqMock }));
jest.mock('@packages/tokenizer', () => ({
  format: formatMock,
  tokenize: tokenizeMock,
}));

import { type Message } from '@core/background';
import { describe, test } from '@jest/globals';
import { handler } from './handler';

describe('handler', () => {
  test('should handle tokenize message', async () => {
    const message: Message = { json: 'json', action: 'tokenize' };
    tokenizeMock.mockResolvedValue('tokenized');

    const sendResponse = jest.fn();

    await handler(message, sendResponse);

    expect(tokenizeMock).toHaveBeenCalledWith(message.json);
    expect(sendResponse).toHaveBeenCalledWith('tokenized');
  });

  test('should handle format message', async () => {
    const message: Message = { json: 'json', action: 'format' };
    formatMock.mockResolvedValue('formatted');

    const sendResponse = jest.fn();

    await handler(message, sendResponse);

    expect(formatMock).toHaveBeenCalledWith(message.json);
    expect(sendResponse).toHaveBeenCalledWith('formatted');
  });

  test('should handle jq message', async () => {
    const message: Message = { json: 'json', query: '.query', action: 'jq' };
    jqMock.mockResolvedValue('jq');

    const sendResponse = jest.fn();

    await handler(message, sendResponse);

    expect(jqMock).toHaveBeenCalledWith(message.json, message.query);
    expect(sendResponse).toHaveBeenCalledWith('jq');
  });

  test('should do nothing if message is not recognized', async () => {
    const message = { json: 'json', action: 'unknown' } as unknown as Message;

    const sendResponse = jest.fn();

    await handler(message, sendResponse);

    expect(sendResponse).not.toHaveBeenCalled();
  });
});
