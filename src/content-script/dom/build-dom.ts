import { createElement } from '@core/dom';
import { type TokenNode, type TupleNode } from '@wasm/types';
import { buildArrayNode } from './build-array-node';
import { buildObjectNode } from './build-object-node';
import { buildBoolNode, buildNullNode, buildNumberNode, buildStringNode } from './build-primitive-nodes';
import { toggle } from './elements';
import { buildInfoNode, isLinkElement, isToggleElement, isValueExpandable } from './helpers';

const roots = new Set<WeakRef<HTMLElement>>();
let listening = false;

const setActiveLinks = (event: KeyboardEvent, active: boolean) => {
  if (event.key !== 'Meta' && event.key !== 'Control') {
    return;
  }

  for (const ref of roots) {
    const root = ref.deref();
    if (root) {
      root.classList.toggle('active-links', active);
    } else {
      roots.delete(ref);
    }
  }
};

const trackActiveLinks = (root: HTMLElement) => {
  roots.add(new WeakRef(root));
  if (!listening) {
    listening = true;
    document.addEventListener('keydown', event => setActiveLinks(event, true));
    document.addEventListener('keyup', event => setActiveLinks(event, false));
  }
};

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

  trackActiveLinks(root);

  root.addEventListener('click', event => {
    const { target } = event;
    if (isToggleElement(target) && target.parentNode instanceof HTMLElement) {
      target.parentNode.classList.toggle('collapsed');
    } else if ((event.metaKey || event.ctrlKey) && isLinkElement(target)) {
      const url = target.getAttribute('href');
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
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
    case 'boolean':
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
