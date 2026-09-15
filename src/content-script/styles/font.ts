import { resource } from '@core/browser';

export const monacoFontFace = (): string => `
@font-face {
  font-family: 'Monaco';
  font-style: normal;
  font-weight: normal;
  src: local('Monaco'), url('${resource('Monaco.woff')}') format('woff');
}
`;
