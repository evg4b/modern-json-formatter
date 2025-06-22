jest.mock('./get-node-with-code');

import { createElement } from '@core/dom';
import { expect } from '@jest/globals';
import { wrapMock } from '@testing/helpers';
import { findNodeWithCode } from './find-node-with-code';
import { getNodeWithCode } from './get-node-with-code';

describe('findNodeWithCode', () => {
  let bodyMock: jest.SpyInstance;
  let addEventListenerMock: jest.SpyInstance;
  let mockNode: HTMLPreElement;

  beforeEach(() => {
    mockNode = createElement({ element: 'pre' });
    bodyMock = jest.spyOn(document, 'body', 'get');
    addEventListenerMock = jest.spyOn(document, 'addEventListener')
      .mockImplementation((event, cb) => {
        bodyMock.mockRestore();

        if (event === 'DOMContentLoaded' && cb instanceof Function) {
          cb(new Event('DOMContentLoaded'));
        }

        throw new Error(`Unexpected event: ${ event }`);
      });

    wrapMock(getNodeWithCode).mockReturnValue(mockNode);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
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
