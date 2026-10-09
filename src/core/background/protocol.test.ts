import { describe, expect, rstest, test } from '@rstest/core';
import { tArray, tBool, tErrorNode, tNull, tNumber, tObject, tProperty, tString } from '@testing/json';
import { type ErrorNode } from '@wasm/types';
import { createClient, createHandler, type Handlers, isErrorNode, type Message } from './protocol';

const handlers = (overrides: Partial<Handlers> = {}): Handlers => ({
  'tokenize': () => tNull(),
  'format': json => `formatted:${json}`,
  'jq': () => ({ type: 'tuple', items: [] }),
  'get-history': () => [],
  'clear-history': () => undefined,
  'get-domains': () => [],
  'download': () => undefined,
  ...overrides,
});

describe('createHandler', () => {
  test('passes the payload to the matching handler', async () => {
    const getHistory = rstest.fn(() => ['.a']);
    const handle = createHandler(handlers({ 'get-history': getHistory }));

    const reply = await handle({ action: 'get-history', payload: { url: 'https://example.com/', prefix: '.' } });

    expect(getHistory).toHaveBeenCalledWith({ url: 'https://example.com/', prefix: '.' });
    expect(reply).toEqual(['.a']);
  });

  test('awaits async handlers', async () => {
    const handle = createHandler(handlers({ 'get-domains': async () => [{ domain: 'a', count: 1 }] }));

    expect(await handle({ action: 'get-domains', payload: undefined })).toEqual([{ domain: 'a', count: 1 }]);
  });

  describe('answers unknown actions with a worker error', () => {
    const cases = [
      { name: 'unknown action', message: { action: 'unknown' }, expected: 'Unknown message type: unknown' },
      { name: 'missing action', message: {}, expected: 'Unknown message type: N/A' },
      { name: 'prototype key', message: { action: 'toString' }, expected: 'Unknown message type: toString' },
      { name: 'no message', message: undefined, expected: 'Unknown message type: N/A' },
    ];

    test.each(cases)('$name', async ({ message, expected }) => {
      const reply = await createHandler(handlers())(message as unknown as Message);

      expect(reply).toEqual({ type: 'error', scope: 'worker', error: expected });
    });
  });

  describe('scopes errors by action', () => {
    const cases = [
      { message: { action: 'tokenize', payload: '{' }, scope: 'tokenizer' },
      { message: { action: 'format', payload: '{' }, scope: 'tokenizer' },
      { message: { action: 'jq', payload: { json: '{}', query: '.' } }, scope: 'jq' },
      { message: { action: 'get-domains', payload: undefined }, scope: 'worker' },
    ] as const;

    test.each(cases)('$message.action → $scope', async ({ message, scope }) => {
      const error = new Error('boom');
      const handle = createHandler(handlers({
        [message.action]: () => {
          throw error;
        },
      }));

      expect(await handle(message as Message)).toEqual({ type: 'error', scope, stack: error.stack, error: 'boom' });
    });
  });

  test('describes non-Error rejections', async () => {
    const handle = createHandler(handlers({ 'clear-history': () => Promise.reject('plain string error') }));

    expect(await handle({ action: 'clear-history', payload: undefined })).toEqual({
      type: 'error',
      scope: 'worker',
      error: 'Unknown error: plain string error',
    });
  });
});

describe('createClient', () => {
  test('sends the action and payload through the transport', async () => {
    const transport = rstest.fn(async () => 'formatted');
    const request = createClient(transport);

    expect(await request('format', '{}')).toBe('formatted');
    expect(transport).toHaveBeenCalledWith({ action: 'format', payload: '{}' });
  });

  test('throws an ErrorNode reply', async () => {
    const error: ErrorNode = tErrorNode('failed');
    const request = createClient(async () => error);

    await expect(request('format', '{}')).rejects.toBe(error);
  });

  test('propagates transport failures', async () => {
    const request = createClient(() => Promise.reject(new Error('disconnected')));

    await expect(request('get-domains', undefined)).rejects.toThrow('disconnected');
  });
});

describe('client and handler through an in-process transport', () => {
  const connect = (overrides: Partial<Handlers> = {}) => createClient(createHandler(handlers(overrides)));

  test('resolves with the handler reply', async () => {
    const request = connect();

    expect(await request('format', '{}')).toBe('formatted:{}');
  });

  test('rejects with a scoped ErrorNode when the handler throws', async () => {
    const request = connect({
      jq: () => {
        throw new Error('unknown function');
      },
    });

    await expect(request('jq', { json: '{}', query: 'nope' })).rejects.toMatchObject({
      type: 'error',
      scope: 'jq',
      error: 'unknown function',
    });
  });
});

describe('isErrorNode', () => {
  test('should return true for ErrorNode', () => {
    const errorNode: ErrorNode = tErrorNode('error message');
    expect(isErrorNode(errorNode)).toBe(true);
  });

  describe('should return false for non-ErrorNode objects', () => {
    const cases = [
      { name: 'empty object', value: {} },
      { name: 'null node', value: tNull() },
      { name: 'boolean node', value: tBool(true) },
      { name: 'string node', value: tString('string') },
      { name: 'number node', value: tNumber('123') },
      { name: 'empty array node', value: tArray() },
      {
        name: 'filed array node',
        value: tArray(tNumber('1')),
      },
      {
        name: 'object node',
        value: tObject(
          tProperty('prop', tNumber('1')),
        ),
      },
    ];

    test.each(cases)('$name', ({ value }) => {
      expect(isErrorNode(value)).toBe(false);
    });
  });

  describe('should return false for non-object values', () => {
    const cases = [
      { name: 'null', value: null },
      { name: 'undefined', value: undefined },
      { name: 'string', value: 'string' },
      { name: 'number', value: 123 },
      { name: 'boolean', value: true },
    ];

    test.each(cases)('$name', ({ value }) => {
      expect(isErrorNode(value)).toBe(false);
    });
  });
});
