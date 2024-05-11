import { element } from './helpres';

export const buildBoolNode = (object: BooleanNode) => {
  const div = document.createElement('span');
  div.className = 'boolean';
  div.appendChild(element(JSON.stringify(object.value)));
  return div;
};
