import { buildDom } from './build-dom';
import { element, isValueExpandable } from './helpres';

export const buildArrayNode = (div: HTMLSpanElement, object: ArrayNode) => {
  div.className = 'array';
  div.appendChild(element({ content: '[', class: 'bracket' }));
  if (object.items.length) {
    const arrayInner = element({ class: 'inner' });
    div.appendChild(arrayInner);
    const lastIndex = object.items.length - 1;
    object.items.forEach((item, index) => {
      const itemDiv = element({ class: 'item' });
      arrayInner.appendChild(itemDiv);
      if (isValueExpandable(item)) {
        itemDiv.appendChild(element({ class: 'toggle' }));
      }
      itemDiv.appendChild(buildDom(item));
      if (index !== lastIndex) {
        itemDiv.appendChild(element({ content: ',' }));
      }
    });
  }
  div.appendChild(element({ content: ']', class: 'bracket' }));
  return div;
};
