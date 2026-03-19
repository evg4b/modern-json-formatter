import '@testing/worker-wasm.mock';
import { type Message } from '@core/background';
import { type TupleNode, type TokenizerResponse } from '@wasm/types';
import { describe, expect, rstest, test } from '@rstest/core';
import { wrapMock } from '@testing/helpers';
import { format, query, tokenize } from '@wasm';
import { handler } from './handler';
import { clearHistory, getDomains, getHistory, pushHistory } from './history';
import { download } from './download';

rstest.mock('./history', () => ({
  getHistory: rstest.fn(),
  clearHistory: rstest.fn(),
  pushHistory: rstest.fn(),
  getDomains: rstest.fn(),
}));

rstest.mock('./download', () => ({
  download: rstest.fn(),
}));

describe('handler', () => {
  describe('worker-core', () => {
    test('should handle tokenize message', async () => {
      const message: Message = { payload: 'json', action: 'tokenize' };
      const tokenized: TokenizerResponse = { type: 'null' };
      wrapMock(tokenize).mockReturnValue(tokenized);

      const response = await handler(message);

      expect(tokenize).toHaveBeenCalledWith(message.payload);
      expect(response).toEqual(tokenized);
    });

    test('should handle format message', async () => {
      const message: Message = { payload: 'json', action: 'format' };
      wrapMock(format).mockReturnValue('formatted');

      const response = await handler(message);

      expect(format).toHaveBeenCalledWith(message.payload);
      expect(response).toEqual('formatted');
    });

    test('should handle jq message', async () => {
      const message: Message = { payload: { json: 'json', query: '.query' }, action: 'jq' };
      const queryResult: TupleNode = { type: 'tuple', items: [] };
      wrapMock(query).mockReturnValue(queryResult);

      const response = await handler(message);

      expect(query).toHaveBeenCalledWith(message.payload.json, message.payload.query);
      expect(response).toEqual(queryResult);
    });
  });

  describe('history', () => {
    test('should handle get-history message', async () => {
      const expected = ['history'];

      const message: Message = { payload: { domain: 'domain', prefix: 'prefix' }, action: 'get-history' };

      wrapMock(getHistory).mockResolvedValue(expected);

      const response = await handler(message);

      expect(getHistory).toHaveBeenCalledWith(message.payload);
      expect(response).toEqual(expected);
    });

    test('should handle clear-history message', async () => {
      const message: Message = { action: 'clear-history', payload: undefined };

      await handler(message);

      expect(clearHistory).toHaveBeenCalled();
    });

    test('should handle push-history message', async () => {
      const message: Message = { payload: { domain: 'domain', query: 'query' }, action: 'push-history' };

      await handler(message);

      expect(pushHistory).toHaveBeenCalledWith(message.payload);
    });

    test('should handle get-domains message', async () => {
      const expected = [{ domain: 'domain', count: 1 }];

      const message: Message = { action: 'get-domains', payload: undefined };

      wrapMock(getDomains).mockResolvedValue(expected);

      const response = await handler(message);

      expect(getDomains).toHaveBeenCalled();
      expect(response).toEqual(expected);
    });
  });

  describe('download', () => {
    test('should handle download message', async () => {
      const message: Message = {
        action: 'download',
        payload: { type: 'formatted', content: '{"key":"value"}', filename: 'test.json' },
      };

      wrapMock(download).mockResolvedValue(undefined);

      await handler(message);

      expect(download).toHaveBeenCalledWith(
        message.payload.type,
        message.payload.content,
        message.payload.filename,
      );
    });
  });

  describe('should throw error', () => {
    test('for unknown message type', async () => {
      const message = { json: 'json', action: 'unknown' } as unknown as Message;

      const response = await handler(message);

      expect(response).toEqual({
        type: 'error',
        scope: 'worker',
        error: 'Unknown message type: unknown',
      });
    });

    test('for undefined message action', async () => {
      const message = { json: 'json' } as unknown as Message;

      const response = await handler(message);

      expect(response).toEqual({
        type: 'error',
        scope: 'worker',
        error: 'Unknown message type: N/A',
      });
    });
  });

  describe('error handling', () => {
    test('should return error node when action throws an Error instance', async () => {
      const error = new Error('something went wrong');
      error.stack = 'Error: something went wrong\n  at handler';
      wrapMock(getHistory).mockRejectedValue(error);

      const message: Message = { payload: { domain: 'x', prefix: '' }, action: 'get-history' };
      const response = await handler(message);

      expect(response).toEqual({
        type: 'error',
        scope: 'worker',
        stack: error.stack,
        error: 'something went wrong',
      });
    });

    test('should set scope to tokenizer for tokenize errors', async () => {
      const error = new Error('tokenize failed');
      error.stack = 'stack';
      wrapMock(tokenize).mockImplementation(() => {
        throw error;
      });

      const message: Message = { payload: 'json', action: 'tokenize' };
      const response = await handler(message);

      expect(response).toEqual({
        type: 'error',
        scope: 'tokenizer',
        stack: error.stack,
        error: 'tokenize failed',
      });
    });

    test('should set scope to jq for jq errors', async () => {
      const error = new Error('jq failed');
      error.stack = 'stack';
      wrapMock(query).mockImplementation(() => {
        throw error;
      });

      const message: Message = { payload: { json: 'json', query: '.foo' }, action: 'jq' };
      const response = await handler(message);

      expect(response).toEqual({
        type: 'error',
        scope: 'jq',
        stack: error.stack,
        error: 'jq failed',
      });
    });

    test('should return error node when action throws a non-Error value', async () => {
      wrapMock(getHistory).mockRejectedValue('plain string error');

      const message: Message = { payload: { domain: 'x', prefix: '' }, action: 'get-history' };
      const response = await handler(message);

      expect(response).toEqual({
        type: 'error',
        scope: 'worker',
        error: 'Unknown error: plain string error',
      });
    });
  });
});
