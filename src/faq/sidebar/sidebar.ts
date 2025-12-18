import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { NavigationItem } from "./models.ts";
import "./buttons";
import "./logo";

declare global {
  interface HTMLElementTagNameMap {
    'mjf-sidebar': SidebarElement;
  }
}

@customElement('mjf-sidebar')
export class SidebarElement extends LitElement {
  public static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      padding: 20px;
      box-sizing: border-box;
    }
      
    .header-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 15px 0;
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
  `;

  @property()
  public items: NavigationItem[] = [];
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
        ${this.items.map(item => html`
          <div>${item.title}</div>
          <div class="section">
            ${item.children?.map(child => html`
                <div>${child.title}</div>
            `)}    
          </div>
        `)}    
      </div>
    `;
  }
}