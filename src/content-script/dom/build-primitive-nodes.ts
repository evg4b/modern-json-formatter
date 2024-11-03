import { BooleanNode, NumberNode, StringNode } from '@packages/tokenizer';
import { element } from './helpres';

export const buildNullNode = () => element({ content: 'null', class: 'null' });

export const buildNumberNode = ({ value }: NumberNode) => element({ content: value, class: 'number' });

export const buildBoolNode = (object: BooleanNode) =>
  element({
    content: object.value ? 'true' : 'false',
    class: 'boolean',
  });

export const buildStringNode = ({ value }: StringNode) =>
  element({
    content: JSON.stringify(value),
    class: 'string',
  });
