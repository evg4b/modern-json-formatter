import { createElement } from '@core/dom';
import { BooleanNode, NumberNode, StringNode } from '@packages/tokenizer';

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

export const buildStringNode = ({ value }: StringNode) =>
  createElement({
    element: 'span',
    content: JSON.stringify(value),
    class: 'string',
  });
