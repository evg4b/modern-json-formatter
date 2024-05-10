import { element } from './helpres';

export const buildDom = (object: ParsedJSON): HTMLElement => {
  const div = document.createElement('span');
  switch (object.type) {
    case  'string':
      div.className = 'string';
      div.appendChild(element(JSON.stringify(object.value)));
      return div;
    case  'number':
      div.className = 'number';
      div.appendChild(element(object.value));
      return div;
    case 'bool':
      div.className = 'boolean';
      div.appendChild(element(JSON.stringify(object.value)));
      return div;
    case 'null':
      div.className = 'null';
      return element('null');
    case 'array':
      div.className = 'array';
      div.appendChild(element('[', { class: 'bracket' }));
      const innerDiv = element('', { class: 'inner' });
      div.appendChild(innerDiv);
      object.items.forEach((item, index) => {
        const subInnerDiv = element('', { class: 'item' });
        innerDiv.appendChild(subInnerDiv);
        subInnerDiv.appendChild(buildDom(item));
        if (index !== (object as unknown as unknown[]).length - 1) {
          subInnerDiv.appendChild(element(','));
        }
      });
      div.appendChild(element(']', { class: 'bracket' }));
      return div;
    case 'object':
      div.className = 'object';
      div.appendChild(element('{'));
      const innerDiv2 = element('', { class: 'inner' });
      div.appendChild(innerDiv2);
      object.properties.forEach(({ key, value }, index) => {
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
    default:
      throw new Error(`Unknown type: ${ object }`);
  }
  return div;
};
