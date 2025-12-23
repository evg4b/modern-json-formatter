import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { boxingFixCss } from '@core/ui/styles';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-error-message': ErrorMessageElement;
  }
}

@customElement('mjf-error-message')
export class ErrorMessageElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        position: absolute;
        top: calc(100% + 5px);
        color: var(--error-color);
        background: var(--error-background);
        font-size: 10px;
        user-select: none;
        padding: 2px 5px;
        border-radius: 5px;
        box-sizing: border-box;
        width: 100%;
      }
    `,
  ];

  public override render() {
    return html`
      <slot></slot>`;
  }
}
