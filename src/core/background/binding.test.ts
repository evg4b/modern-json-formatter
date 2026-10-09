import '@testing/browser.mock';
import { sendMessage } from '@core/browser';
import { wrapMock } from '@testing/helpers';
import type { ErrorNode, TokenNode, TupleNode } from '@wasm/types';
import { clearHistory, download, format, getDomains, getHistory, jq, tokenize } from './binding';
import { type DomainCount } from './protocol';
import { beforeEach, describe, expect, rstest, test } from '@rstest/core';

describe('binding', () => {
  const mockSendMessage = wrapMock(sendMessage);

  beforeEach(() => {
    rstest.clearAllMocks();
  });

  test('format should resolve with formatted JSON', async () => {
    const mockResponse = 'formatted-json';
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await format('json');
    expect(result).toBe(mockResponse);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'format', payload: 'json' });
  });

  test('jq should resolve with TupleNode', async () => {
    const mockResponse: TupleNode = { type: 'tuple', items: [] };
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await jq('json', 'query');
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'jq', payload: { json: 'json', query: 'query', url: undefined } });
  });

  test('jq should pass the page url', async () => {
    mockSendMessage.mockResolvedValue({ type: 'tuple', items: [] });

    await jq('json', 'query', 'https://example.com/');
    expect(mockSendMessage)
      .toHaveBeenCalledWith({ action: 'jq', payload: { json: 'json', query: 'query', url: 'https://example.com/' } });
  });

  test('tokenize should resolve with TokenNode', async () => {
    const mockResponse: TokenNode = { type: 'null' };
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await tokenize('json');
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'tokenize', payload: 'json' });
  });

  test('getHistory should resolve with history entries', async () => {
    const mockResponse: string[] = [];
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await getHistory('https://example.com/', 'prefix');
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage)
      .toHaveBeenCalledWith({ action: 'get-history', payload: { url: 'https://example.com/', prefix: 'prefix' } });
  });

  test('clearHistory should resolve with void', async () => {
    mockSendMessage.mockResolvedValue(undefined);

    await clearHistory();
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'clear-history', payload: undefined });
  });

  test('download should call sendMessage with correct payload', async () => {
    mockSendMessage.mockResolvedValue(undefined);

    await download('raw', 'content', 'file.json');
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: 'download',
      payload: { type: 'raw', content: 'content', filename: 'file.json' },
    });
  });

  test('getDomains should resolve with domain counts', async () => {
    const mockResponse: DomainCount[] = [{ domain: 'example.com', count: 5 }];
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await getDomains();
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'get-domains', payload: undefined });
  });

  test('should reject with ErrorNode if response is an ErrorNode', async () => {
    const mockError: ErrorNode = { error: 'error', type: 'error', scope: 'jq' };
    mockSendMessage.mockResolvedValue(mockError);

    await expect(format('json')).rejects.toBe(mockError);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'format', payload: 'json' });
  });
});
