import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from "lit/directives/class-map.js";

declare global {
  interface HTMLElementTagNameMap {
    'mjf-button': ButtonElement;
  }
}

@customElement('mjf-button')
export class ButtonElement extends LitElement {
  static styles = css`
      :host {
          display: inline-block;
      }

      button {
          border-radius: 5px;
          padding: 3px 10px;
          background: var(--button-background);
          color: var(--button-color);
          border: 1px solid var(--button-border-color);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          min-width: 40px;
          display: block;
          user-select: none;
          transition-property: background, background-color, border-color, color;
          transition-duration: 0.2s;
          transition-timing-function: ease-in-out;

          &:hover {
              background: var(--button-hover-background);
              border-color: var(--button-hover-border-color);
              color: var(--button-hover-color);
          }

          &.active {
              background: var(--button-active-background);
              border-color: var(--button-active-border-color);
              color: var(--button-active-color);
              cursor: default;
          }

          &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
          }
      }
  `;

  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) active = false;

  render() {
    return html`
        <button ?disabled=${ this.disabled }
                class=${classMap({ active: this.active })}>
            <slot></slot>
        </button>
    `;
  }
}
