import { CustomElement } from '@core/dom';
import { BaseButtonElement } from './button';
import icon from './ko-fi-button-icon.svg';

@CustomElement('ko-fi-button')
export class KoFiButton extends BaseButtonElement {
  constructor() {
    super(icon);
  }
}
