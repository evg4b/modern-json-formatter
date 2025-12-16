import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    'mjf-github-button': GithubButtonElement;
  }
}

@customElement('mjf-github-button')
export class GithubButtonElement extends LitElement {
  public override render() {
    return html`
        github button
    `;
  }
}