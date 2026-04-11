import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './error-node.scss?inline';
import invalid from './invalid.svg?raw';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-error-node': ErrorNodeElement;
  }
}

@customElement('mjf-error-node')
export class ErrorNodeElement extends LitElement {
  public static override readonly styles = [unsafeCSS(styles)];

  @property({ type: String })
  public header = '';

  @property({ type: Array })
  public lines: string[] = [];

  private get lineTemplates() {
    return this.lines.map(line => html`<span>${line}</span>`);
  }

  public override render() {
    return html`
      <div class="error">
        ${unsafeSVG(invalid)}
        <div class="message">
          <span>${this.header}</span>
          ${this.lineTemplates}
        </div>
      </div>
    `;
  }
}
