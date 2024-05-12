import { buildArrayNode } from './build-array-node';
import { buildBoolNode } from './build-boolean-node';
import { buildNullNode } from './build-null-node';
import { buildNumberNode } from './build-number-node';
import { buildObjectNode } from './build-object-node';
import { buildStringNode } from './build-string-node';

export const buildDom = (object: ParsedJSON): HTMLElement => {
  const div = document.createElement('span');
  switch (object.type) {
    case  'string':
      return buildStringNode(object);
    case  'number':
      return buildNumberNode(object);
    case 'bool':
      return buildBoolNode(object);
    case 'null':
      return buildNullNode();
    case 'array':
      return buildArrayNode(div, object);
    case 'object':
      return buildObjectNode(div, object);
    default:
      throw new Error('Unknown type');
  }
};
