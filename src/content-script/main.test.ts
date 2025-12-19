import { wrapMock } from '@testing/helpers';
import { noop } from 'es-toolkit';
import { runExtension } from './extension';
import { rstest, describe, test, expect, afterAll, beforeAll } from '@rstest/core';

rstest.mock('./extension', () => ({
  runExtension: rstest.fn(),
}));

describe('main', () => {
  const error = new Error('Test error');
  let consoleErrorSpy: ReturnType<typeof rstest.spyOn>;

  beforeAll(async () => {
    consoleErrorSpy = rstest.spyOn(console, 'error')
      .mockImplementation(noop);

    wrapMock(runExtension).mockRejectedValueOnce(error);

    await import('./main');
  });

  afterAll(() => consoleErrorSpy.mockRestore());

  test('should launch extension', () => {
    expect(runExtension).toHaveBeenCalled();
  });

  test('should handle error', () => {
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error running extension:', error);
  });
});
