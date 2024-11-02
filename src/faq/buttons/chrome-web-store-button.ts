import { BaseButtonElement } from './button';
import icon from './chrome-web-store-button-icon.svg';

class ChromeWebStoreButton extends BaseButtonElement {
  constructor() {
    super(icon);
  }
}

customElements.define('chrome-web-store-button', ChromeWebStoreButton);
