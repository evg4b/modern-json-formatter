import { t } from '../helpres';
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
export const propertiesCount = (count: number) => element({
  content: `// ${ t('json_viewer_properties', count.toString()) }`,
  class: 'properties-count',
});
export const itemsCount = (count: number) => element({
  content: `// ${ t('json_viewer_items', count.toString()) }`,
  class: 'items-count',
});
