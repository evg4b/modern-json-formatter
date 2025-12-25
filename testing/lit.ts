import { afterEach, beforeEach, expect, test } from '@rstest/core';
import { LitElement } from 'lit';

type TagName = keyof HTMLElementTagNameMap;
type Element<T extends TagName> = HTMLElementTagNameMap[T];

export const renderLitElement = <T extends TagName>(tag: T, callback: (element: Element<T>) => void | unknown | Promise<unknown>) => {
  let element: HTMLElementTagNameMap[T] | null = null;

  beforeEach(async () => {
    element = document.createElement(tag);
    document.body.appendChild(element);

    if (element instanceof LitElement) {
      await element.updateComplete;
    }

    await callback(element);
  });

  afterEach(() => {
    document.body.removeChild(element!);
  });
};

export const defaultLitAsserts = <T extends TagName>(type: unknown, getter: () => Element<T>) => {
  // @ts-expect-error incorrect type definition
  test(`should be instance of ${type?.name}`, () => {
    expect(getter()).toBeInstanceOf(type);
  });

  test('should have a shadowRoot', () => {
    expect(getter().shadowRoot).not.toBeNull();
  });
};

