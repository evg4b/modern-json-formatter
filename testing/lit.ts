import { afterEach, beforeEach, expect, test } from '@rstest/core';

type TagName = keyof HTMLElementTagNameMap;
type Element<T extends TagName> = HTMLElementTagNameMap[T];

export const renderLitElement = <T extends TagName>(tag: T, callback: (element: Element<T>) => void | unknown | Promise<unknown>) => {
  let element: HTMLElementTagNameMap[T] | null = null;

  beforeEach(async () => {
    element = document.createElement(tag);
    document.body.appendChild(element);

    await callback(element);
  });

  afterEach(() => {
    document.body.removeChild(element!);
  });
};

export const defaultLitAsserts = <T extends TagName>(type: unknown, getter: () => Element<T>) => {
  test(`should be instance of ${type?.constructor?.name}`, () => {
    expect(getter()).toBeInstanceOf(type);
  });

  test('should have a shadowRoot', () => {
    expect(getter().shadowRoot).not.toBeNull();
  });
};
