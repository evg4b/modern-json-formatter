import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import logo from './logo.svg?raw';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-logo': LogoElement;
  }
}

export type LogoSize = '512' | '256' | '128' | '48' | '32';

@customElement('mjf-logo')
export class LogoElement extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }
    
    svg {
      display: block;
      width: var(--mjf-logo-size, 32px);
      height: var(--mjf-logo-size, 32px);
    }
  `;

  @property()
  public size: LogoSize = '32';

  @property()
  public alt?: string;

  public override updated() {
    this.style.setProperty('--mjf-logo-size', `${this.size}px`);
  }

  public override render() {
    return html`${unsafeSVG(logo)}`;
  }
}
