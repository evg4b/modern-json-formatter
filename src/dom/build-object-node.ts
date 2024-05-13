import { buildDom } from './build-dom';
import { element, isValueExpandable } from './helpres';

export const buildObjectNode = (div: HTMLSpanElement, object: ObjectNode) => {
  div.className = 'object';
  div.appendChild(element({ content: '{', class: 'bracket' }));
  if (object.properties.length) {
    const objectInner = element({ class: 'inner' });
    div.appendChild(objectInner);
    div.appendChild(element({ class: 'ellipsis' }));
    const lastIndex = object.properties.length - 1;
    object.properties.forEach(({ key, value }, index) => {
      const propertyDiv = element({ class: 'property' });
      objectInner.appendChild(propertyDiv);
      if (isValueExpandable(value)) {
        propertyDiv.appendChild(element({ class: 'toggle' }));
      }
      propertyDiv.appendChild(element({ content: JSON.stringify(key), class: 'key' }));
      propertyDiv.appendChild(element({ content: ':', class: 'colon' }));
      propertyDiv.appendChild(buildDom(value));
      if (index !== lastIndex) {
        propertyDiv.appendChild(element({ content: ',' }));
      }
    });
  }
  div.appendChild(element({ content: '}', class: 'bracket' }));
  return div;
};
