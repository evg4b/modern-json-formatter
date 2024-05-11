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
      if (object.items.length) {
        const innerDiv = element('', { class: 'inner' });
        div.appendChild(innerDiv);
        const lastIndex = object.items.length - 1;
        object.items.forEach((item, index) => {
          const subInnerDiv = element('', { class: 'item' });
          innerDiv.appendChild(subInnerDiv);
          subInnerDiv.appendChild(buildDom(item));
          if (index !== lastIndex) {
            subInnerDiv.appendChild(element(','));
          }
        });
      }
      div.appendChild(element(']', { class: 'bracket' }));
      return div;
    case 'object':
      div.className = 'object';
      div.appendChild(element('{'));
      if (object.properties.length) {
        const innerDiv2 = element('', { class: 'inner' });
        div.appendChild(innerDiv2);
        const lastIndex = object.properties.length - 1;
        object.properties.forEach(({ key, value }, index) => {
          const subInnerDiv = element('', { class: 'property' });
          innerDiv2.appendChild(subInnerDiv);
          subInnerDiv.appendChild(element(JSON.stringify(key)));
          subInnerDiv.appendChild(element(':'));
          subInnerDiv.appendChild(buildDom(value));
          if (index !== lastIndex) {
            subInnerDiv.appendChild(element(','));
          }
        });
      }
      div.appendChild(element('}'));
      return div;
    default:
      throw new Error(`Unknown type: ${ object }`);
  }

  return div;
};
