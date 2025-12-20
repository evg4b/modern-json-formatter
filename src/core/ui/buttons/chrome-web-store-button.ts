import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ButtonMixin } from './button.mixin';
import { BUTTONS } from '@core/constants';
import icon from './chrome-web-store-button-icon.svg?raw';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-chrome-web-store-button': ChromeWebStoreButtonElement;
  }
}

@customElement('mjf-chrome-web-store-button')
export class ChromeWebStoreButtonElement extends ButtonMixin(LitElement) {
  public override render() {
    return this.renderLink(icon, BUTTONS.CHROME_WEB_STORE);
  }
}
