import { element } from './helpres';

export const toggle = () => element({ class: 'toggle' });
export const ellipsis = () => element({ class: 'ellipsis' });
export const comma = () => element({ content: ',', class: 'comma' });
export const colon = () => element({ content: ':', class: 'colon' });
export const bracket = {
  open: () => element({ content: '{', class: 'bracket bracket-open' }),
  close: () => element({ content: '}', class: 'bracket bracket-close' }),
};

export const squareBracket = {
  open: () => element({ content: '[', class: 'bracket square-bracket-open' }),
  close: () => element({ content: ']', class: 'bracket square-bracket-close' }),
};

export const propertiesCount = (count: number) =>
  element({
    content: `// ${count} propert${count === 1 ? 'y' : 'ies'}`,
    class: 'properties-count',
  });

export const itemsCount = (count: number) =>
  element({
    content: `// ${count} item${count === 1 ? '' : 's'}`,
    class: 'items-count',
  });
