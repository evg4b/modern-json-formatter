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
          border: 1px solid #a8c7fa;
          color: #a8c7fa;
          border-radius: 30px;
          padding: 3px 10px;
          background-color: transparent;

          transition-property: color, border, background-color;
          transition-duration: 250ms;
          transition-timing-function: ease-in;

          &:hover {
            cursor: pointer;
            border-color: #a8c7fa;
            color: #282828;
            background-color: #a8c7fa;
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
