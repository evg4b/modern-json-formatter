import { describe, expect, test } from '@rstest/core';
import { wait } from './helpers';

describe('wait', () => {
  test('resolves with the request result on success', async () => {
    const request = {} as IDBRequest<string>;
    const promise = wait(request);

    request.result = 'ok';
    request.onsuccess!(new Event('success'));

    await expect(promise).resolves.toBe('ok');
  });

  test('rejects with request.error when it is set', async () => {
    const request = {} as IDBRequest<string>;
    const error = new DOMException('db error');
    const promise = wait(request);

    request.error = error;
    request.onerror!(new Event('error'));

    await expect(promise).rejects.toBe(error);
  });

  test('rejects with fallback error when request.error is null', async () => {
    const request = {} as IDBRequest<string>;
    const promise = wait(request);

    request.error = null;
    request.onerror!(new Event('error'));

    await expect(promise).rejects.toThrow('IDBRequest failed');
  });
});
