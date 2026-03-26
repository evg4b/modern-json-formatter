import { describe, expect, test } from '@rstest/core';
import { wait } from './helpers';

const makeRequest = <T>(result: T, error: DOMException | null = null) => ({ result, error, onsuccess: null, onerror: null }) as unknown as IDBRequest<T>;

describe('wait', () => {
  test('resolves with the request result on success', async () => {
    const request = makeRequest('ok');
    const promise = wait(request);

    request.onsuccess!(new Event('success'));

    await expect(promise).resolves.toBe('ok');
  });

  test('rejects with request.error when it is set', async () => {
    const error = new DOMException('db error');
    const request = makeRequest(undefined, error);
    const promise = wait(request);

    request.onerror!(new Event('error'));

    await expect(promise).rejects.toBe(error);
  });

  test('rejects with fallback error when request.error is null', async () => {
    const request = makeRequest(undefined, null);
    const promise = wait(request);

    request.onerror!(new Event('error'));

    await expect(promise).rejects.toThrow('IDBRequest failed');
  });
});
