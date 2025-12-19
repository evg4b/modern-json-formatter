import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { FloatingMessageController } from './floating-message.controller';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-floating-message': FloatingMessageElement;
  }
}

export type FloatingMessageType = 'error-message' | 'info-message';

@customElement('mjf-floating-message')
export class FloatingMessageElement extends LitElement {
  public static override styles = css`
      .wrapper {
          display: flex;
          position: fixed;
          right: 25px;
          bottom: 15px;
          padding: 10px;
          background: #282828;
          color: #eee;
          box-shadow: 0 5px 10px 0 rgb(0 0 0 / 70%);
          border-radius: 5px;
          font-size: 10px;
          flex-direction: column;
          max-width: 300px;
          user-select: none;
          opacity: 0;
          transform: translateY(50%);
          transition: all 250ms ease-in-out;
      }

      .header-container {
          display: flex;
          flex-direction: row;
      }

      .header-container .header {
          flex: 1 1 auto;
          margin-bottom: 5px;
          font-size: 12px;
      }

      .header-container .close {
          cursor: pointer;
          width: 12px;
          height: 12px;
          position: relative;

          &:before,
          &:after {
              position: absolute;
              width: 2px;
              background-color: #eee;
              left: 5px;
              content: " ";
              height: 12px;
          }

          &:before {
              transform: rotate(45deg);
          }

          &:after {
              transform: rotate(-45deg);
          }
      }

      .wrapper.visible {
          opacity: 1;
          transform: translateY(0);
      }
      
      :host([type="error-message"]) .wrapper,
      :host([type="error-message"]) .header-container {
          background: var(--error-background) !important;
          color: var(--error-color) !important;
      }
  `;

  private readonly controller = new FloatingMessageController(this);

  @property({ type: String, reflect: true })
  public type: FloatingMessageType = 'info-message';

  @property({ type: String })
  public header: string | null = null;

  public override render() {
    const classes = classMap({
      visible: this.controller.visible,
      wrapper: true,
    });

    return html`
      <div class=${classes}>
        <div class="header-container">
            <div class="header">${this.header}</div>
            <div class="close" @click=${this.close}></div>
        </div>
        <slot></slot>
      </div>
    `;
  }

  private close() {
    this.controller.close();
  }
}
