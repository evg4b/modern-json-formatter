import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { boxingFixCss } from '@core/ui/styles';

export type StickyPanelPosition = 'rightTop' | 'rightBottom' | 'leftTop' | 'leftBottom';

@customElement('mjf-sticky-panel')
export class StickyPanelElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        display: flex;
        flex-direction: column;
        position: fixed;
        background: var(--background);
        box-shadow: 0 0 3px 3px var(--background);
      }

      :host([position="rightTop"]),
      :host([position="rightBottom"]) {
        right: 0;
        align-items: end;
      }

      :host([position="leftTop"]),
      :host([position="leftBottom"]) {
        left: 0;
        align-items: start;
      }

      :host([position="rightTop"]) {
        top: 0;
        padding: 10px 25px 5px 5px;
      }

      :host([position="rightBottom"]) {
        bottom: 0;
        padding: 5px 25px 10px 5px;
      }

      :host([position="leftTop"]) {
        left: 0;
        padding: 10px 25px 5px 5px;
      }

      :host([position="leftBottom"]) {
        bottom: 0;
        padding: 10px 25px 5px 5px;
      }
    `,
  ];

  @property({ type: String, reflect: true })
  public position: StickyPanelPosition = 'rightTop';

  public override render() {
    return html`
      <slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mjf-sticky-panel': StickyPanelElement;
  }
}
