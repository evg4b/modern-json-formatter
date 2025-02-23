import { jest } from '@jest/globals';
import type { FunctionLike } from 'jest-mock';

export const wrapMock = <T extends FunctionLike>(mock: unknown): jest.Mock<T> => {
  if (jest.isMockFunction(mock)) {
    return mock as jest.Mock<T>;
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Mocked function expected: ${ mock }`);
};
