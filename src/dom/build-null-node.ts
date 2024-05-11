import { element } from './helpres';

export const buildNullNode = () => {
  const div = document.createElement('span');
  div.className = 'null';
  div.appendChild(element('null'));
  return div;
};
