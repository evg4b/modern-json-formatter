import '@testing/worker-core.mock';
import { type Message } from '@core/background';
import { describe, expect, jest, test } from '@jest/globals';
import { wrapMock } from '@testing/helpers';
import { format, jq, tokenize } from '@worker-core';
import { handler } from './handler';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';

jest.mock('./history', () => ({
  getHistory: jest.fn(),
  clearHistory: jest.fn(),
  pushHistory: jest.fn(),
  getDomains: jest.fn(),
}));

describe('handler', () => {
  describe('worker-core', () => {
    test('should handle tokenize message', async () => {
      const message: Message = { json: 'json', action: 'tokenize' };
      wrapMock(tokenize).mockResolvedValue('tokenized');

      const response = await handler(message);

      expect(tokenize).toHaveBeenCalledWith(message.json);
      expect(response).toEqual('tokenized');
    });

    test('should handle format message', async () => {
      const message: Message = { json: 'json', action: 'format' };
      wrapMock(format).mockResolvedValue('formatted');

      const response = await handler(message);

      expect(format).toHaveBeenCalledWith(message.json);
      expect(response).toEqual('formatted');
    });

    test('should handle jq message', async () => {
      const message: Message = { json: 'json', query: '.query', action: 'jq' };
      wrapMock(jq).mockResolvedValue('jq');

      const response = await handler(message);

      expect(jq).toHaveBeenCalledWith(message.json, message.query);
      expect(response).toEqual('jq');
    });
  });

  describe('history', () => {
    test('should handle get-history message', async () => {
      const expected = ['history'];

      const message: Message = { domain: 'domain', prefix: 'prefix', action: 'get-history' };

      wrapMock(getHistory).mockResolvedValue(expected);

      const response = await handler(message);

      expect(getHistory).toHaveBeenCalledWith(message.domain, message.prefix);
      expect(response).toEqual(expected);
    });

    test('should handle clear-history message', async () => {
      const message: Message = { action: 'clear-history' };

      await handler(message);

      expect(clearHistory).toHaveBeenCalled();
    });

    test('should handle push-history message', async () => {
      const message: Message = { domain: 'domain', query: 'query', action: 'push-history' };

      await handler(message);

      expect(pushHistory).toHaveBeenCalledWith(message.domain, message.query);
    });

    test('should handle get-domains message', async () => {
      const expected = [{ domain: 'domain', count: 1 }];

      const message: Message = { action: 'get-domains' };

      wrapMock(getDomains).mockResolvedValue(expected);

      const response = await handler(message);

      expect(getDomains).toHaveBeenCalled();
      expect(response).toEqual(expected);
    });
  });

  test('should throw error', async () => {
    const message = { json: 'json', action: 'unknown' } as unknown as Message;

    const response = await handler(message);

    expect(response).toEqual({
      type: 'error',
      scope: 'worker',
      error: 'Unknown message type',
    });
  });
});
