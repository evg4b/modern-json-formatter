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
  test('should handle tokenize message', () => {
    const message: Message = { json: 'json', action: 'tokenize' };
    tokenizeMock.mockReturnValue('tokenized');

    const response = handler(message);

    expect(tokenizeMock).toHaveBeenCalledWith(message.json);
    expect(response).toEqual('tokenized');
  });

  test('should handle format message', () => {
    const message: Message = { json: 'json', action: 'format' };
    formatMock.mockReturnValue('formatted');

    const response = handler(message);

    expect(formatMock).toHaveBeenCalledWith(message.json);
    expect(response).toEqual('formatted');
  });

  test('should handle jq message', () => {
    const message: Message = { json: 'json', query: '.query', action: 'jq' };
    jqMock.mockReturnValue('jq');

    const response = handler(message);

    expect(jqMock).toHaveBeenCalledWith(message.json, message.query);
    expect(response).toEqual('jq');
  });

  test('should throw error', () => {
    const message = { json: 'json', action: 'unknown' } as unknown as Message;

    const response = handler(message);

    expect(response).toEqual({
      type: 'error',
      scope: 'worker',
      error: 'Unknown message',
    });
  });
});
