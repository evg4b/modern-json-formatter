import { CustomElement } from '@core/dom';
import { BaseButtonElement } from './button';
import icon from './chrome-web-store-button-icon.svg';

@CustomElement('chrome-web-store-button')
export class ChromeWebStoreButton extends BaseButtonElement {
  constructor() {
    super(icon);
  }
}
