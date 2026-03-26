import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { boxingFixCss } from '@core/styles/lit';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-rounded-button': RoundedButtonElement;
  }
}

@customElement('mjf-rounded-button')
export class RoundedButtonElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        display: inline-flex;

        button {
          border: 1px solid var(--button-border-color);
          color: var(--button-color);
          border-radius: 30px;
          padding: 3px 10px;
          background-color: transparent;

          transition-property: color, border, background-color;
          transition-duration: 250ms;
          transition-timing-function: ease-in;

          &:hover {
            cursor: pointer;
            border-color: var(--button-hover-border-color);
            color: var(--button-hover-color);
            background-color: var(--button-hover-background);
          }
        }
      }
    `,
  ];

  public override render() {
    return html`
      <button>
        <slot></slot>
      </button>
    `;
  }
}
