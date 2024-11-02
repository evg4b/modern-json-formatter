import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';
import { isEqual, isEqualWith } from 'lodash';
import sortAny from 'sort-any';

const customizer = (a: unknown, b: unknown) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    let i = 0;

    return isEqualWith(sortAny(a), sortAny(b), (a, b) => {
      if (!i) {
        i++;
        return isEqual(a, b);
      }
      return isEqualWith(a, b, customizer);
    });
  }

  return undefined;
};

const toSoftEqual: MatcherFunction<[object: object]> =
  function (actual: unknown, expected: object) {
    return {
      message: () => {
        const actualFmt = this.utils.printReceived(actual);
        const expectedFmt = this.utils.printExpected(actual);

        return `expected ${ actualFmt } to be equal ${ expectedFmt }`;
      },
      pass: isEqualWith(actual, expected, customizer),
    };
  };

expect.extend({ toSoftEqual });

declare module 'expect' {
  interface AsymmetricMatchers {
    toSoftEqual(object: object): void;
  }

  interface Matchers<R> {
    toSoftEqual(object: object): R;
  }
}
