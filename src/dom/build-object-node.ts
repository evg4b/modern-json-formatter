import { buildDom } from './build-dom';
import { element } from './helpres';

export const buildObjectNode = (div: HTMLSpanElement, object: ObjectNode) => {
  div.className = 'object';
  div.appendChild(element('{', { class: 'bracket' }));
  if (object.properties.length) {
    const innerDiv2 = element('', { class: 'inner' });
    div.appendChild(innerDiv2);
    const lastIndex = object.properties.length - 1;
    object.properties.forEach(({ key, value }, index) => {
      const subInnerDiv = element('', { class: 'property' });
      innerDiv2.appendChild(subInnerDiv);
      subInnerDiv.appendChild(element(JSON.stringify(key), { class: 'key' }));
      subInnerDiv.appendChild(element(':'));
      subInnerDiv.appendChild(buildDom(value));
      if (index !== lastIndex) {
        subInnerDiv.appendChild(element(','));
      }
    });
  }
  div.appendChild(element('}', { class: 'bracket' }));
  return div;
};
