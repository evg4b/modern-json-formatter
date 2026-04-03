import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { boxingFixCss, buttonStylesCss } from '@core/styles/lit';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-error-message': ErrorMessageElement;
  }
}

@customElement('mjf-error-message')
export class ErrorMessageElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    buttonStylesCss,
    css`
      :host {
        color: var(--error-color);
        background: var(--error-background);
        font-size: 15px;
        user-select: none;
        padding: 2px 5px;
        border-radius: 5px;
        box-sizing: border-box;
      }
      
      :host([small]) {
        font-size: 10px;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true })
  public small = false;

  public override render() {
    return html`
      <slot></slot>
    `;
  }
}
