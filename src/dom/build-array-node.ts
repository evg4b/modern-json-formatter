import { buildNode } from './build-dom';
import { comma, ellipsis, toggle } from './elements';
import { element, isValueExpandable } from './helpres';

export const buildArrayNode = (object: ArrayNode) => {
  const div = document.createElement('span');
  div.className = 'array';
  div.appendChild(element({ content: '[', class: 'bracket' }));
  if (object.items.length) {
    const arrayInner = element({ class: 'inner' });
    div.appendChild(arrayInner);
    div.appendChild(ellipsis());
    const lastIndex = object.items.length - 1;
    object.items.forEach((item, index) => {
      const itemDiv = element({ class: 'item' });
      arrayInner.appendChild(itemDiv);
      if (isValueExpandable(item)) {
        itemDiv.appendChild(toggle());
      }
      itemDiv.appendChild(buildNode(item));
      if (index !== lastIndex) {
        itemDiv.appendChild(comma());
      }
    });
  }
  div.appendChild(element({ content: ']', class: 'bracket' }));
  return div;
};
