import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import icon from './ko-fi-button-icon.svg?raw';
import { ButtonMixin } from './button.mixin.ts';
import { BUTTONS } from '@core/constants';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-ko-fi-button': KoFiButtonElement;
  }
}

@customElement('mjf-ko-fi-button')
export class KoFiButtonElement extends ButtonMixin(LitElement) {
  public override render() {
    return this.renderLink(icon, BUTTONS.KO_FI);
  }
}
