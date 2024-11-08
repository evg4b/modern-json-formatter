import { createElement } from '@core/dom';
import { TokenNode, TupleNode } from '@packages/tokenizer';
import { buildArrayNode } from './build-array-node';
import { buildObjectNode } from './build-object-node';
import { buildBoolNode, buildNullNode, buildNumberNode, buildStringNode } from './build-primitive-nodes';
import { toggle } from './elements';
import { buildInfoNode, isToggleElement, isValueExpandable } from './helpres';

export const buildDom = (object: TokenNode | TupleNode): HTMLElement => {
  if (object.type === 'tuple') {
    return createElement({
      class: 'tuple',
      element: 'div',
      children: object.items.map(buildDom),
    });
  }

  const root = createElement({ element: 'span', class: 'root' });

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
    if (isToggleElement(target) && target.parentNode instanceof HTMLElement) {
      target.parentNode.classList.toggle('collapsed');
    }
  });

  return root;
};

export const buildNode = (object: TokenNode): HTMLElement => {
  switch (object.type) {
    case 'string':
      return buildStringNode(object);
    case 'number':
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
