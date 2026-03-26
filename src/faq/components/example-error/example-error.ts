import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { resource } from '@core/browser';
import { boxingFixCss } from '@core/styles/lit';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-example-error': ExampleErrorElement;
  }
}

@customElement('mjf-example-error')
export class ExampleErrorElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        display: block;
      }

      .error {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        color: var(--error-color);
        user-select: none;

        img {
          width: 20px;
          height: 20px;
          user-select: none;
          pointer-events: none;
          flex-shrink: 0;
        }

        .message {
          font-family: monospace;
          font-size: 12px;
        }
      }
    `,
  ];

  @property({ type: String })
  public message = '';

  public override render() {
    return html`
      <div class="error">
        <img src=${resource('invalid.svg')} alt="Error" />
        <div class="message">
          <span>${this.message}</span>
        </div>
      </div>
    `;
  }
}
