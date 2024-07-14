import { buildArrayNode } from './build-array-node';
import { buildObjectNode } from './build-object-node';
import { buildBoolNode, buildNullNode, buildNumberNode, buildStringNode } from './build-primitive-nodes';
import { toggle } from './elements';
import { buildInfoNode, element, isToggleElement, isValueExpandable } from './helpres';

export const buildDom = (object: TokenNode): HTMLElement => {
  const root = element({ class: 'root' });

  if (isValueExpandable(object)) {
    root.appendChild(toggle());
    root.classList.add('padding');
  }

  root.append(buildNode(object));
  const infoNode = buildInfoNode(object);
  if (infoNode) {
    root.appendChild(infoNode);
  }

  root.addEventListener('click', ({ target }) => {
    if (isToggleElement(target) && (target.parentNode instanceof HTMLElement)) {
      target.parentNode.classList.toggle('collapsed');
    }
  });

  return root;
};


export const buildNode = (object: TokenNode): HTMLElement => {
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
      return buildArrayNode(object);
    case 'object':
      return buildObjectNode(object);
    default:
      throw new Error('Unknown type');
  }
};
