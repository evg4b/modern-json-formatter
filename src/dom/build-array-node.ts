import { buildDom } from './build-dom';
import { element } from './helpres';

export const buildArrayNode = (div: HTMLSpanElement, object: ArrayNode) => {
  div.className = 'array';
  div.appendChild(element('[', { class: 'bracket' }));
  if (object.items.length) {
    const innerDiv = element('', { class: 'inner' });
    div.appendChild(innerDiv);
    const lastIndex = object.items.length - 1;
    object.items.forEach((item, index) => {
      const subInnerDiv = element('', { class: 'item' });
      innerDiv.appendChild(subInnerDiv);
      subInnerDiv.appendChild(buildDom(item));
      if (index !== lastIndex) {
        subInnerDiv.appendChild(element(','));
      }
    });
  }
  div.appendChild(element(']', { class: 'bracket' }));
  return div;
};
