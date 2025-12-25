import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { isInViewport } from './is-in-viewport';

function mockRect(rect: Partial<DOMRect>) {
  return {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
    ...rect,
  } as DOMRect;
}

describe('isInViewport', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');

    Object.defineProperty(window, 'innerWidth', { value: 100, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 100, configurable: true });
  });

  test('returns true when element fully in viewport', () => {
    el.getBoundingClientRect = rstest.fn(() => mockRect({ top: 0, left: 0, bottom: 100, right: 100 }));

    expect(isInViewport(el)).toBe(true);
  });

  test('returns false when top < 0', () => {
    el.getBoundingClientRect = rstest.fn(() => mockRect({ top: -1, left: 0, bottom: 50, right: 50 }));

    expect(isInViewport(el)).toBe(false);
  });

  test('returns false when left < 0', () => {
    el.getBoundingClientRect = rstest.fn(() => mockRect({ top: 0, left: -1, bottom: 50, right: 50 }));

    expect(isInViewport(el)).toBe(false);
  });

  test('returns false when bottom > innerHeight', () => {
    el.getBoundingClientRect = rstest.fn(() => mockRect({ top: 0, left: 0, bottom: 101, right: 50 }));

    expect(isInViewport(el)).toBe(false);
  });

  test('returns false when right > innerWidth', () => {
    el.getBoundingClientRect = rstest.fn(() => mockRect({ top: 0, left: 0, bottom: 50, right: 101 }));

    expect(isInViewport(el)).toBe(false);
  });

  test('uses documentElement.clientWidth/clientHeight when inner* is undefined', () => {
    Object.defineProperty(window, 'innerWidth', { value: undefined, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: undefined, configurable: true });

    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 80,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 80,
      configurable: true,
    });

    el.getBoundingClientRect = rstest.fn(() => mockRect({ top: 0, left: 0, bottom: 80, right: 80 }));

    expect(isInViewport(el)).toBe(true);
  });
});
