import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../faq/sidebar/logo';
import './options.css';

@customElement('mjf-options-page')
export class OptionsPageElement extends LitElement {
  public static override styles = css`
      .container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
          padding: 20px;
          max-width: 700px;
          width: 100%;
          box-sizing: border-box;
      }
      
      .header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 15px;
          user-select: none;

          h2 {
              text-align: center;
          }
      }
  `;

  public override render() {
    return html`
      <div class="container">
        <div class="header">
            <mjf-logo alt="sadsad" title="sadsadklsdkj" size="48"></mjf-logo>
            <h2>Modern JSON Formatter Options</h2>
        </div>
        <div>
            
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mjf-options-page': OptionsPageElement;
  }
}