import { createElement } from '@core/dom';
import { type ArrayNode } from '@worker-core';
import { buildNode } from './build-dom';
import { comma, ellipsis, squareBracket, toggle } from './elements';
import { buildInfoNode, isValueExpandable } from './helpres';

export const buildArrayNode = ({ items }: ArrayNode) => {
  const arrayNode = createElement({ element: 'span', class: 'array' });
  arrayNode.appendChild(squareBracket.open());

  if (items.length) {
    const innerNode = createElement({ element: 'span', class: 'inner' });
    arrayNode.append(innerNode, ellipsis());
    const lastIndex = items.length - 1;
    items.forEach((item, index) => {
      const itemNode = createElement({ element: 'span', class: 'item' });
      innerNode.appendChild(itemNode);
      if (isValueExpandable(item)) {
        itemNode.appendChild(toggle());
      }
      itemNode.appendChild(buildNode(item));
      if (index !== lastIndex) {
        itemNode.appendChild(comma());
      }
      const infoNode = buildInfoNode(item);
      if (infoNode) {
        itemNode.appendChild(infoNode);
      }
    });
  }
  arrayNode.appendChild(squareBracket.close());

  return arrayNode;
};
