import { buildNode } from './build-dom';
import { colon, comma, ellipsis, toggle } from './elements';
import { element, isValueExpandable } from './helpres';

export const buildObjectNode = (object: ObjectNode) => {
  const objectNode = element({ class: 'object' });
  objectNode.appendChild(element({ content: '{', class: 'bracket' }));
  if (object.properties.length) {
    const objectInnerNode = element({ class: 'inner' });
    objectNode.appendChild(objectInnerNode);
    objectNode.appendChild(ellipsis());
    const lastIndex = object.properties.length - 1;
    object.properties.forEach(({ key, value }, index) => {
      const propertyDiv = element({ class: 'property' });
      objectInnerNode.appendChild(propertyDiv);
      if (isValueExpandable(value)) {
        propertyDiv.appendChild(toggle());
      }
      propertyDiv.appendChild(element({ content: JSON.stringify(key), class: 'key' }));
      propertyDiv.appendChild(colon());
      propertyDiv.appendChild(buildNode(value));
      if (index !== lastIndex) {
        propertyDiv.appendChild(comma());
      }
    });
  }
  objectNode.appendChild(element({ content: '}', class: 'bracket' }));
  return objectNode;
};
