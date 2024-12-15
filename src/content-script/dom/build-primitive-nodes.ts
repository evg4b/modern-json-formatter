import { createElement } from '@core/dom';
import { trim } from '@core/helpers';
import { type BooleanNode, type NumberNode, type StringNode } from '@worker-core';

export const buildNullNode = () =>
  createElement({
    element: 'span',
    content: 'null',
    class: 'null',
  });

export const buildNumberNode = ({ value }: NumberNode) =>
  createElement({
    element: 'span',
    content: value,
    class: 'number',
  });

export const buildBoolNode = (object: BooleanNode) =>
  createElement({
    element: 'span',
    content: object.value ? 'true' : 'false',
    class: 'boolean',
  });

export const buildStringNode = ({ value, variant }: StringNode) => {
  if (variant === 'url') {
    return createElement({
      element: 'span',
      content: JSON.stringify(value),
      class: ['string', 'url'],
      attributes: {
        href: trim(value, ' \t\n\r'),
      },
    });
  }

  if (variant === 'email') {
    return createElement({
      element: 'span',
      content: JSON.stringify(value),
      class: ['string', 'email'],
      attributes: {
        href: `mailto:${value}`,
      },
    });
  }

  return createElement({
    element: 'span',
    content: JSON.stringify(value),
    class: 'string',
  });
};
