import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    'mjf-logo': LogoElement;
  }
}

const imagesMap = {
  '512': './icon512.png',
  '256': './icon256.png',
  '128': './icon128.png',
  '48': './icon48.png',
  '32': './icon32.png',
};

@customElement('mjf-logo')
export class LogoElement extends LitElement {
  @property()
  public size: keyof typeof imagesMap = '32';

  @property()
  public alt?: string;

  public override render() {
    return html`
      <img src=${imagesMap[this.size]}
           alt=${this.alt} 
           title=${this.title}
      />
    `;
  }
}