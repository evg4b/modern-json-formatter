import { element } from './helpres';

export const buildNumberNode = (object: NumberNode) => {
  return element({ content: object.value, class: 'number' });
};
