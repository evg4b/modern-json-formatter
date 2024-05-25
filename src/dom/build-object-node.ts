import { buildNode } from './build-dom';
import { bracket, colon, comma, ellipsis, toggle } from './elements';
import { buildInfoNode, element, isValueExpandable } from './helpres';


export const buildObjectNode = (object: ObjectNode) => {
  const objectNode = element({ class: 'object' });
  objectNode.appendChild(bracket.open());

  if (object.properties.length) {
    const innerNode = element({ class: 'inner' });
    objectNode.append(innerNode, ellipsis());
    const lastIndex = object.properties.length - 1;
    object.properties.forEach(({ key, value }, index) => {
      const propertyNode = element({ class: 'property' });
      innerNode.appendChild(propertyNode);
      if (isValueExpandable(value)) {
        propertyNode.appendChild(toggle());
      }
      propertyNode.append(
        element({ content: JSON.stringify(key), class: 'key' }),
        colon(),
        buildNode(value),
      );
      if (index !== lastIndex) {
        propertyNode.appendChild(comma());
      }
      const infoNode = buildInfoNode(value);
      if (infoNode) {
        propertyNode.appendChild(infoNode);
      }
    });
  }
  objectNode.appendChild(bracket.close());

  return objectNode;
};
