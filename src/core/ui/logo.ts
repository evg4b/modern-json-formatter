import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { resource } from '@core/browser';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-logo': LogoElement;
  }
}

type LogoSize = '512' | '256' | '128' | '48' | '32';

const imagesMap: Record<LogoSize, string> = {
  512: resource('./icon512.png'),
  256: resource('./icon256.png'),
  128: resource('./icon128.png'),
  48: resource('./icon48.png'),
  32: resource('./icon32.png'),
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
