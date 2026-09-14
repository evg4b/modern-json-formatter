import { resource } from '@core/browser';

/*
 * `@font-face` is document scoped — Chrome ignores it inside a shadow root — and
 * Chrome substitutes `__MSG_@@extension_id__` only in manifest-declared CSS, not
 * in styles injected at runtime. So the face goes into the document head with
 * the URL resolved here. Platforms with Monaco installed match on `local()` and
 * never noticed either of those.
 */
export const monacoFontFace = (): string => `
@font-face {
  font-family: 'Monaco';
  font-style: normal;
  font-weight: normal;
  src: local('Monaco'), url('${resource('Monaco.woff')}') format('woff');
}
`;
