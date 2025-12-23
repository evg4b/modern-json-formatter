import icon from './info-button-icon.svg?raw';
import { css, html, LitElement } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { customElement, property } from 'lit/decorators.js';
import { boxingFixCss } from '@core/ui/styles';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-info-button': InfoButtonElement;
  }
}

@customElement('mjf-info-button')
export class InfoButtonElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      a {
        color: var(--icon-color);
        transition: all 150ms ease;

        &:hover {
          color: var(--icon-hover-color);
        }
      }

      svg, a {
        display: flex;
      }
    `,
  ];

  @property({ type: String })
  public url = '';

  public override render() {
    return html`
      <a class="info-button" target="_blank" href=${this.url}>
        ${unsafeSVG(icon)}
      </a>
    `;
  }
}
