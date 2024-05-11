import { element } from './helpres';

export const buildNumberNode = (object: NumberNode) => {
  const div = document.createElement('span');
  div.className = 'number';
  div.appendChild(element(object.value));
  return div;
};
