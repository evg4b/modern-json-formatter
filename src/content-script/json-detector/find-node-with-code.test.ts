import { beforeEach, describe, expect, test, afterEach, rstest } from '@rstest/core';

rstest.mock('./get-node-with-code', () => ({
  getNodeWithCode: rstest.fn().mockName('getNodeWithCode'),
}));

import { createElement } from '@core/dom';
import { wrapMock } from '@testing/helpers';
import { findNodeWithCode } from './find-node-with-code';
import { getNodeWithCode } from './get-node-with-code';

describe.skip('findNodeWithCode', () => {
  let bodyMock: ReturnType<typeof rstest.spyOn>;
  let addEventListenerMock: ReturnType<typeof rstest.spyOn>;
  let mockNode: HTMLPreElement;

  beforeEach(() => {
    mockNode = createElement({ element: 'pre' });
    bodyMock = rstest.spyOn(document, 'body', 'get');
    addEventListenerMock = rstest.spyOn(document, 'addEventListener')
      .mockImplementation((event, cb) => {
        bodyMock.mockRestore();

        if (event === 'DOMContentLoaded' && cb instanceof Function) {
          cb(new Event('DOMContentLoaded'));
        }

        throw new Error(`Unexpected event: ${event}`);
      });

    wrapMock(getNodeWithCode).mockReturnValue(mockNode);
  });

  afterEach(() => {
    rstest.resetAllMocks();
    rstest.clearAllMocks();
  });

  test('should resolve with node when body is present', async () => {
    const result = await findNodeWithCode();
    expect(result).toBe(mockNode);
    const unknownChildNodes: NodeListOf<ChildNode> = document.body.childNodes;
    expect(getNodeWithCode as unknown).toHaveBeenCalledWith(unknownChildNodes);
    expect(addEventListenerMock).not.toHaveBeenCalled();
  });

  test('should resolve with node after DOMContentLoaded when body is not present initially', async () => {
    bodyMock.mockReturnValue(null);

    const result = await findNodeWithCode();

    expect(result).toBe(mockNode);
    expect(getNodeWithCode as unknown).toHaveBeenCalledWith(document.body.childNodes);
    expect(addEventListenerMock).toHaveBeenCalled();
  });
});
