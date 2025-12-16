import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { NavigationItem } from "./models.ts";
import "./github-button";

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
  `;

  @property()
  public items: NavigationItem[] = [];

  public override render() {
    return html`
      <div>
        <div>
          <img src="" alt="">
          <div>Modern JSON Formatter</div>
        </div>
        <div>
          <mjf-github-button></mjf-github-button>
          <a href="">ChromeWebStoreButton</a>
          <a href="">KoFiButton</a>
        </div>
      </div>
      ${this.items.map(item => html`
        <div>${item.title}</div>
        ${item.children?.map(child => html`<div>${child.title}</div>`)}
      `)}
    `;
  }
}