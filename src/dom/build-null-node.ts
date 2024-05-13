import { element } from './helpres';

export const buildNullNode = () => {
  return element({ content: 'null', class: 'null' });
};
