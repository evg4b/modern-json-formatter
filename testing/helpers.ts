import { type Mock } from '@rstest/core';

export const wrapMock = <T extends (...args: Parameters<T>) => ReturnType<T>>(mock: T): Mock<T> => {
  return mock as unknown as Mock<T>;
};
