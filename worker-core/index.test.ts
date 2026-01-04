/*
 * import '@testing/wasm';
 * import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, rstest, test } from '@rstest/core';
 * import { wrapMock } from '@testing/helpers';
 * import { format, jq, tokenize } from './index';
 * import { importWasm } from './wasm';
 *
 * describe('worker-core', () => {
 *   const nonStringValues = [
 *     { name: 'null', value: null as unknown as string },
 *     { name: 'undefined', value: undefined as unknown as string },
 *     { name: 'non-void and not string value', value: ['xxx'] as unknown as string },
 *   ];
 *
 *   beforeAll(() => {
 *     rstest.spyOn(console, 'log')
 *       .mockReturnValue();
 *   });
 *
 *   beforeEach(() => {
 *     wrapMock(importWasm).mockClear();
 *   });
 *
 *   afterAll(() => {
 *     rstest.resetAllMocks();
 *   });
 *
 *   const globalFactory = (key: string) => {
 *     afterEach(() => {
 *       Reflect.deleteProperty(globalThis, key);
 *     });
 *
 *     return () => Reflect.set(globalThis, key, rstest.fn()
 *       .mockName(key)
 *       .mockResolvedValue({}));
 *   };
 *
 *   describe('tokenize', () => {
 *     const setGlobal = globalFactory('___tokenizeJSON');
 *
 *     test('should load wasm if env is not initialized', async () => {
 *       wrapMock(importWasm).mockImplementation(() => {
 *         setGlobal();
 *         return Promise.resolve();
 *       });
 *
 *       await expect(tokenize('{}')).resolves.toEqual({});
 *
 *       expect(importWasm).toHaveBeenCalled();
 *     });
 *
 *     test('should use exising env if it was initialized', async () => {
 *       setGlobal();
 *
 *       await expect(tokenize('{}')).resolves.toEqual({});
 *
 *       expect(importWasm).not.toHaveBeenCalled();
 *     });
 *
 *     test.each(nonStringValues)('should throw error if input is $name', async ({ value }) => {
 *       setGlobal();
 *
 *       await expect(tokenize(value))
 *         .rejects
 *         .toThrow('tokenize expects a string input');
 *     });
 *   });
 *
 *   describe('format', () => {
 *     const setGlobal = globalFactory('___formatJSON');
 *
 *     test('should load wasm if env is not initialized', async () => {
 *       wrapMock(importWasm).mockImplementation(() => {
 *         setGlobal();
 *         return Promise.resolve();
 *       });
 *
 *       await expect(format('{}')).resolves.toEqual({});
 *
 *       expect(importWasm).toHaveBeenCalled();
 *     });
 *
 *     test('should use exising env if it was initialized', async () => {
 *       setGlobal();
 *
 *       await expect(format('{}')).resolves.toEqual({});
 *
 *       expect(importWasm).not.toHaveBeenCalled();
 *     });
 *
 *     test.each(nonStringValues)('should throw error if input is $name', async ({ value }) => {
 *       await expect(format(value))
 *         .rejects
 *         .toThrow('format expects a string input');
 *     });
 *   });
 *
 *   describe('jq', () => {
 *     const setGlobal = globalFactory('___jq');
 *
 *     test('should load wasm if env is not initialized', async () => {
 *       wrapMock(importWasm).mockImplementation(() => {
 *         setGlobal();
 *         return Promise.resolve();
 *       });
 *
 *       await expect(jq({ json: '{}', query: '.' })).resolves.toEqual({});
 *
 *       expect(importWasm).toHaveBeenCalled();
 *     });
 *
 *     test('should use exising env if it was initialized', async () => {
 *       setGlobal();
 *
 *       await expect(jq({ json: '{}', query: '.' })).resolves.toEqual({});
 *
 *       expect(importWasm).not.toHaveBeenCalled();
 *     });
 *
 *     test.each(nonStringValues)('should throw error if json is $name', async ({ value }) => {
 *       await expect(jq({ json: value, query: 'key' }))
 *         .rejects
 *         .toThrow('jq expects a string input for json');
 *     });
 *
 *     test.each(nonStringValues)('should throw error if query is $name', async ({ value }) => {
 *       await expect(jq({ json: '{}', query: value }))
 *         .rejects
 *         .toThrow('jq expects a string input for query');
 *     });
 *   });
 * });
 */

import { expect, test } from '@rstest/core';

test('', () => {
  expect(1).toBe(1);
});
