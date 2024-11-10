import { ArrayNode, ObjectNode, TokenNode } from '@packages/tokenizer';
import { itemsCount, propertiesCount } from './elements';

export const isValueExpandable = (value: TokenNode): value is ObjectNode | ArrayNode =>
  (value.type === 'object' && !!value.properties.length) || (value.type === 'array' && !!value.items.length);

export const isToggleElement = (element: EventTarget | null): element is HTMLElement => {
  return element instanceof HTMLElement && element.classList.contains('toggle');
};

export const isLinkElement = (element: EventTarget | null): element is HTMLElement => {
  return element instanceof HTMLElement && element.classList.contains('url');
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
