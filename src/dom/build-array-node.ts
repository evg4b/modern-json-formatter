import { buildDom } from './build-dom';
import { element } from './helpres';

export const buildArrayNode = (div: HTMLSpanElement, object: ArrayNode) => {
  div.className = 'array';
  div.appendChild(element('[', { class: 'bracket' }));
  if (object.items.length) {
    const arrayInner = element('', { class: 'inner' });
    div.appendChild(arrayInner);
    const lastIndex = object.items.length - 1;
    object.items.forEach((item, index) => {
      const itemDiv = element('', { class: 'item' });
      arrayInner.appendChild(itemDiv);
      itemDiv.appendChild(buildDom(item));
      if (index !== lastIndex) {
        itemDiv.appendChild(element(','));
      }
    });
  }
  div.appendChild(element(']', { class: 'bracket' }));
  return div;
};
