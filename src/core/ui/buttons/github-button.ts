import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import icon from './github-button-icon.svg?raw';
import { ButtonMixin } from './button.mixin';
import { BUTTONS } from '@core/constants';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-github-button': GithubButtonElement;
  }
}

@customElement('mjf-github-button')
export class GithubButtonElement extends ButtonMixin(LitElement) {
  public override render() {
    return this.renderLink(icon, BUTTONS.GITHUB);
  }
}
