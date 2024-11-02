import { BaseButtonElement } from './button';
import icon from './github-button-icon.svg';

class GithubButton extends BaseButtonElement {
  constructor() {
    super(icon);
  }
}

customElements.define('github-button', GithubButton);
