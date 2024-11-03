import { ArrayNode, ObjectNode, TokenNode } from '@packages/tokenizer';
import { itemsCount, propertiesCount } from './elements';

export const element = (options?: { content?: string; class?: string; block?: boolean }) => {
  const span = document.createElement(!options?.block ? 'span' : 'div');
  if (options?.content) {
    span.appendChild(document.createTextNode(options.content));
  }
  if (options?.class) {
    span.className = options.class;
  }

  return span;
};

interface Options<K extends keyof HTMLElementTagNameMap = 'span'> {
  element: K;
  content?: string;
  class?: string | string[];
  children?: HTMLElement[] | HTMLElement;
  attributes?: { [key: string]: string };
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(options: Options<K>): HTMLElementTagNameMap[K] => {
  const element = document.createElement(options.element ?? 'span');
  if (options.content) {
    element.appendChild(document.createTextNode(options.content));
  }
  if (options.class) {
    const classList = [options.class].flat();
    element.classList.add(...classList);
  }
  if (options.children) {
    const children = [options.children].flat();
    element.append(...children);
  }
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  return element;
};

export const isValueExpandable = (value: TokenNode): value is ObjectNode | ArrayNode =>
  (value.type === 'object' && !!value.properties.length) || (value.type === 'array' && !!value.items.length);

export const isToggleElement = (element: EventTarget | null): element is HTMLElement => {
  return element instanceof HTMLElement && element.classList.contains('toggle');
};

export const buildInfoNode = (value: TokenNode): HTMLSpanElement | null => {
  if (isValueExpandable(value)) {
    switch (value.type) {
      case 'array':
        return itemsCount(value.items.length);
      case 'object':
        return propertiesCount(value.properties.length);
      default:
        throw new Error('Unknown type');
    }
  }

  return null;
};
