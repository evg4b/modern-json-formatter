import { rstest, type Mock } from "@rstest/core";

// @ts-expect-error temporal solution
export const wrapMock = <T>(mock: unknown): Mock<T> => {
  if (rstest.isMockFunction(mock)) {
    // @ts-expect-error - temporal solution
    return mock as unknown as Mock<T>;
  }

  throw new Error(`Mocked function expected: ${ mock }`);
};
