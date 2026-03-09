import { customElement, property } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';
import { boxingFixCss } from '@core/styles/lit';
import { cache } from 'lit/directives/cache.js';
import { map } from 'lit/directives/map.js';

export interface DropdownOption {
  label: string;
  onClick: () => void;
}

declare global {
  interface HTMLElementTagNameMap {
    'mjf-dropdown': DropdownElement;
  }
}

@customElement('mjf-dropdown')
export class DropdownElement extends LitElement {
  public static formAssociated = true;

  public static override readonly styles = [
    boxingFixCss,
    css`
      :host-context(:popover-open) {
        display: flex;
        flex-direction: column;
        background-color: #282828;
        border: 1px solid #636363;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        position-area: bottom !important;
        top: anchor(bottom);
        right: anchor(right);
        margin-top: 8px;
        padding: 0;
      }

      button {
        border: none;
        background-color: transparent;
        padding: 8px 10px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        font-size: 14px;
        width: 100%;
        text-align: left;
        display: flex;
        align-items: center;

        &:hover {
          background-color: #3c3c3c;
        }
      }
    `,
  ];

  @property({ type: Array })
  public options: DropdownOption[] = [];

  public override connectedCallback() {
    super.connectedCallback?.();
    this.setAttribute('popover', 'auto');
    this.addEventListener('click', this.hidePopover);
  }

  public override disconnectedCallback() {
    super.disconnectedCallback?.();
    this.removeEventListener('click', this.hidePopover);
  }

  public override render() {
    return cache(map(this.options, ({ label, onClick }, index) => html`
      <button @click=${onClick} tabindex=${index}>
        ${label}
      </button>
    `));
  }
}
