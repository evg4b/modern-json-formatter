import '@webcomponents/custom-elements';
import { wrapMock } from '@testing/helpers';
import { noop } from 'lodash';
import { runExtension } from './extension';

jest.mock('./extension', () => ({
  runExtension: jest.fn(),
}));

describe('main', () => {
  const error = new Error('Test error');
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error')
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
