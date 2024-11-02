import { BaseButtonElement } from './button';
import icon from './ko-fi-button-icon.svg';

class KoFiButton extends BaseButtonElement {
  constructor() {
    super(icon);
  }
}

customElements.define('ko-fi-button', KoFiButton);
