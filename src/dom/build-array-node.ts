import { ArrayNode } from '@packages/tokenizer';
import { buildNode } from './build-dom';
import { comma, ellipsis, squareBracket, toggle } from './elements';
import { buildInfoNode, element, isValueExpandable } from './helpres';

export const buildArrayNode = ({ items }: ArrayNode) => {
  const arrayNode = element({ class: 'array' });
  arrayNode.appendChild(squareBracket.open());

  if (items.length) {
    const innerNode = element({ class: 'inner' });
    arrayNode.append(innerNode, ellipsis());
    const lastIndex = items.length - 1;
    items.forEach((item, index) => {
      const itemNode = element({ class: 'item' });
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
