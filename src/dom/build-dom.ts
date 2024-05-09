import { clone, element } from './helpres';
import nullNode from './nodes';

export const buildDom = (object: unknown): HTMLElement => {
  const div = document.createElement('span');
  switch (true) {
    case typeof object === 'string':
    case typeof object === 'number':
    case object === true || object === false:
      div.className = 'primitive';
      div.appendChild(element(JSON.stringify(object)));
      return div;
    case object === null:
      div.className = 'primitive';
      return clone(nullNode);
    case Array.isArray(object):
      div.className = 'array';
      div.appendChild(element('[', { class: 'bracket' }));
      const innerDiv = element('', { class: 'inner' });
      div.appendChild(innerDiv);
      object.forEach((item, index) => {
        const subInnerDiv = element('', { class: 'item' });
        innerDiv.appendChild(subInnerDiv);
        subInnerDiv.appendChild(buildDom(item));
        if (index !== (object as unknown as unknown[]).length - 1) {
          subInnerDiv.appendChild(element(','));
        }
      });
      div.appendChild(element(']', { class: 'bracket' }));
      return div;
    case typeof object === 'object':
      div.className = 'object';
      div.appendChild(element('{'));
      const innerDiv2 = element('', { class: 'inner' });
      div.appendChild(innerDiv2);
      Object.entries(object as any).forEach(([key, value], index) => {
        const subInnerDiv = element('', { class: 'property' });
        innerDiv2.appendChild(subInnerDiv);
        subInnerDiv.appendChild(element(JSON.stringify(key)));
        subInnerDiv.appendChild(element(':'));
        subInnerDiv.appendChild(buildDom(value));
        if (index !== (object as unknown as string).length - 1) {
          subInnerDiv.appendChild(element(','));
        }
      });
      div.appendChild(element('}'));
      return div;
  }
  return div;
};
