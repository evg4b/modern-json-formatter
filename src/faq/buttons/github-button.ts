import { CustomElement } from '@core/dom';
import { BaseButtonElement } from './button';
import icon from './github-button-icon.svg';

@CustomElement('github-button')
export class GithubButton extends BaseButtonElement {
  constructor() {
    super(icon);
  }
}
