const formatMock = jest.fn();
const tokenizeMock = jest.fn();
const jqMock = jest.fn();

jest.mock('@worker-core', () => ({
  format: formatMock,
  tokenize: tokenizeMock,
  jq: jqMock,
}));

import { type Message } from '@core/background';
import { describe, test } from '@jest/globals';
import { handler } from './handler';

describe('handler', () => {
  test('should handle tokenize message', async () => {
    const message: Message = { json: 'json', action: 'tokenize' };
    tokenizeMock.mockResolvedValue('tokenized');

    const response = await handler(message);

    expect(tokenizeMock).toHaveBeenCalledWith(message.json);
    expect(response).toEqual('tokenized');
  });

  test('should handle format message', async () => {
    const message: Message = { json: 'json', action: 'format' };
    formatMock.mockResolvedValue('formatted');

    const response = await handler(message);

    expect(formatMock).toHaveBeenCalledWith(message.json);
    expect(response).toEqual('formatted');
  });

  test('should handle jq message', async () => {
    const message: Message = { json: 'json', query: '.query', action: 'jq' };
    jqMock.mockResolvedValue('jq');

    const response = await handler(message);

    expect(jqMock).toHaveBeenCalledWith(message.json, message.query);
    expect(response).toEqual('jq');
  });

  test('should throw error', async () => {
    const message = { json: 'json', action: 'unknown' } as unknown as Message;

    const response = await handler(message);

    expect(response).toEqual({
      type: 'error',
      scope: 'worker',
      error: 'Unknown message',
    });
  });
});
