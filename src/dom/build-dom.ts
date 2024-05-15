import { buildArrayNode } from './build-array-node';
import { buildBoolNode } from './build-boolean-node';
import { buildNullNode } from './build-null-node';
import { buildNumberNode } from './build-number-node';
import { buildObjectNode } from './build-object-node';
import { buildStringNode } from './build-string-node';
import { toggle } from './elements';
import { element, isToogleElement } from './helpres';

export const buildDom = (object: ParsedJSON): HTMLElement => {
  const root = element({ class: 'root' });
  if (object.type === 'object' && object.properties.length) {
    root.appendChild(toggle());
    root.classList.add('padding');
  } else if (object.type === 'array' && object.items.length) {
    root.appendChild(toggle());
    root.classList.add('padding');
  }

  root.appendChild(buildNode(object));

  root.addEventListener('click', ({ target }) => {
    if (!isToogleElement(target)) {
      return;
    }

    if ((target.parentNode instanceof HTMLElement)) {
      target.parentNode.classList.toggle('collapsed');
    }
  });

  return root;
};


export const buildNode = (object: ParsedJSON): HTMLElement => {
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
