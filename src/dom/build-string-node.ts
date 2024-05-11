import { element } from './helpres';

export const buildStringNode = (object: StringNode) => {
  const div = document.createElement('span');
  div.className = 'string';
  div.appendChild(element(JSON.stringify(object.value)));
  return div;
};
