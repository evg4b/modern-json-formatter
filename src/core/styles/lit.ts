import { unsafeCSS } from 'lit';
import inlineCodeStyles from './inline-code.scss?inline';
import boxingStyles from './boxing.scss?inline';
import buttonStyles from './button.scss?inline';

export const inlineCodeCss = unsafeCSS(inlineCodeStyles);
export const boxingFixCss = unsafeCSS(boxingStyles);
export const buttonStylesCss = unsafeCSS(buttonStyles);
