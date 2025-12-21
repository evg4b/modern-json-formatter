import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { NavigationItem } from './models';
import '@core/ui/buttons';
import '@core/ui/logo';
import './side-bar-link';
import { map } from 'lit/directives/map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { inlineCodeCss } from '@core/ui/styles';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-sidebar': SidebarElement;
  }
}

@customElement('mjf-sidebar')
export class SidebarElement extends LitElement {
  public static override styles = [
    inlineCodeCss,
    css`
      :host {
        display: flex;
        flex-direction: column;
        padding: 20px 20px 20px 0;
        box-sizing: border-box;
      }

      .header-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 15px 0 15px 20px;
        user-select: none;
      }

      .header {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .name {
        text-align: center;
        font-weight: 600;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .menu {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .links {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
    `,
  ];

  @property({ type: Array })
  public items: NavigationItem[] = [];

  @property({ type: String })
  // eslint-disable-next-line lit/attribute-names
  public activeItem: string | null = null;

  public override render() {
    return html`
      <div class="header-container">
        <div class="header">
          <mjf-logo alt="sadsad" title="sadsadklsdkj" size="128"></mjf-logo>
          <div class="name">Modern JSON Formatter</div>
        </div>
        <div class="links">
          <mjf-github-button></mjf-github-button>
          <mjf-ko-fi-button></mjf-ko-fi-button>
          <mjf-chrome-web-store-button></mjf-chrome-web-store-button>
        </div>
      </div>
      <div class="menu">
        ${map(this.items, item => html`
          <mjf-sidebar-link .item=${item}
                            .active=${this.activeItem === item.id}
                            .title=${item.title}>
            <span>${unsafeHTML(item.titleHtml)}</span>
          </mjf-sidebar-link>
          ${item.children && html`
            <div class="section">
              ${item.children?.map(child => html`
                <mjf-sidebar-link .item=${child}
                                  .active=${this.activeItem === child.id}
                                  .title=${item.title}>
                  <span>${unsafeHTML(child.titleHtml)}</span>
                </mjf-sidebar-link>
              `)}
            </div>
          `}
        `)}
      </div>
    `;
  }
}
