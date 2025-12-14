import '@testing/browser.mock';
import { sendMessage } from '@core/browser';
import { wrapMock } from '@testing/helpers';
import type { ErrorNode, TokenizerResponse } from '@worker-core';
import { clearHistory, format, getDomains, getHistory, jq, pushHistory, tokenize } from './binding';
import { type DomainCountResponse, type HistoryResponse } from './models';
import { beforeEach, describe, expect, rstest, test } from "@rstest/core";

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

  test('jq should resolve with TokenizerResponse', async () => {
    const mockResponse: TokenizerResponse = { type: 'null' };
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await jq('json', 'query');
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'jq', payload: { json: 'json', query: 'query' } });
  });

  test('tokenize should resolve with TokenizerResponse', async () => {
    const mockResponse: TokenizerResponse = { type: 'null' };
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await tokenize('json');
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'tokenize', payload: 'json' });
  });

  test('getHistory should resolve with HistoryResponse', async () => {
    const mockResponse: HistoryResponse = [];
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await getHistory('domain', 'prefix');
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage)
      .toHaveBeenCalledWith({ action: 'get-history', payload: { domain: 'domain', prefix: 'prefix' } });
  });

  test('clearHistory should resolve with void', async () => {
    mockSendMessage.mockResolvedValue(undefined);

    await clearHistory();
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'clear-history', payload: undefined });
  });

  test('pushHistory should resolve with void', async () => {
    mockSendMessage.mockResolvedValue(undefined);

    await pushHistory('domain', 'query');
    expect(mockSendMessage)
      .toHaveBeenCalledWith({ action: 'push-history', payload: { domain: 'domain', query: 'query' } });
  });

  test('getDomains should resolve with DomainCountResponse', async () => {
    const mockResponse: DomainCountResponse = [{ domain: 'example.com', count: 5 }];
    mockSendMessage.mockResolvedValue(mockResponse);

    const result = await getDomains();
    expect(result).toEqual(mockResponse);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'get-domains', payload: undefined });
  });

  test('should reject with ErrorNode if response is an error', async () => {
    const mockError: ErrorNode = { error: 'error', type: 'error', scope: 'jq' };
    mockSendMessage.mockResolvedValue(mockError);

    await expect(format('json')).rejects.toEqual(mockError);
    expect(mockSendMessage).toHaveBeenCalledWith({ action: 'format', payload: 'json' });
  });
});
