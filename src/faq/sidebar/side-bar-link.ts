import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { NavigationItem } from './models';
import { classMap } from 'lit/directives/class-map.js';
import { isInViewport } from '@core/helpers';
import { boxingFixCss } from '@core/styles/lit';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-sidebar-link': SideBarLinkElement;
  }
}

@customElement('mjf-sidebar-link')
export class SideBarLinkElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        --sidebar-link-background: var(--background);
        --sidebar-link-color: var(--base-text-color);
        display: flex;
        flex-direction: column;

        a {
          border-radius: 0 30px 30px 0;
          padding: 5px 10px 5px 20px;
          color: var(--sidebar-link-color);
          overflow: hidden;
          position: relative;
          background: var(--sidebar-link-background);
          transition-property: background-color, color;
          transition-duration: 150ms;
          transition-timing-function: ease-in-out;
          text-decoration: none;
          display: flex;

          &:hover {
            --sidebar-link-background: var(--background-hover);
          }

          &.active {
            --sidebar-link-background: var(--button-active-background);
            --sidebar-link-color: var(--button-active-color);
          }
        }
      }

      :host-context(.section) {
        a {
          padding-left: 40px;
        }
      }
    `,
  ];

  @property({ type: Object })
  public item!: NavigationItem;

  @property({ type: Boolean, converter: Boolean })
  public active: boolean = false;

  public override updated(args: Map<string, unknown>) {
    if (args.has('active')) {
      const newActive = !!args.get('active');
      if (newActive !== this.active && !isInViewport(this)) {
        this.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }

  public override render() {
    return html`
      <a href="#" @click=${this.onClick}
         class=${classMap({ active: this.active })}>
        <slot></slot>
      </a>
    `;
  }

  private onClick(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    this.item.ref.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'center',
    });
  }
}
