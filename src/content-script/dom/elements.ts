import { createElement } from '@core/dom';

export const toggle = () => createElement({ element: 'span', class: 'toggle' });
export const ellipsis = () => createElement({ element: 'span', class: 'ellipsis' });
export const comma = () => createElement({ element: 'span', content: ',', class: 'comma' });
export const colon = () => createElement({ element: 'span', content: ':', class: 'colon' });
export const bracket = {
  open: () => createElement({ element: 'span', content: '{', class: ['bracket', 'bracket-open'] }),
  close: () => createElement({ element: 'span', content: '}', class: ['bracket', 'bracket-close'] }),
};

export const squareBracket = {
  open: () => createElement({ element: 'span', content: '[', class: ['bracket', 'square-bracket-open'] }),
  close: () => createElement({ element: 'span', content: ']', class: ['bracket', 'square-bracket-close'] }),
};

export const propertiesCount = (count: number) => createElement({
  element: 'span',
  content: `// ${count} propert${count === 1 ? 'y' : 'ies'}`,
  class: 'properties-count',
});

export const itemsCount = (count: number) => createElement({
  element: 'span',
  content: `// ${count} item${count === 1 ? '' : 's'}`,
  class: 'items-count',
});
