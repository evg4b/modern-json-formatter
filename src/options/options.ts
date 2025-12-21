import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { clearHistory, getDomains } from '@core/background';
import type { TableColumn } from '@core/ui/table';
import { until } from 'lit/directives/until.js';
import '@core/ui';

import './options.scss';

const columns: TableColumn[] = [
  { title: 'Domain', path: 'domain' },
  { title: 'Count', path: 'count' },
];

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

      & > h2 {
        text-align: center;
      }
    }

    .section {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      & > h2 {
        margin: 0;
      }

      mjf-rounded-button {
        display: block;
      }
    }

    .separator {
      width: 100%;
      margin-top: 15px;
      margin-bottom: 35px;
      height: 1px;
      border: none;
      background: #636363;
    }

    mjf-table-element {
      width: 100%;
    }
  `;

  @state()
  private content = getDomains();

  public override render() {
    return html`
      <div class="container">
        <div class="header">
          <mjf-logo alt="sadsad" title="sadsadklsdkj" size="48"></mjf-logo>
          <h2>Modern JSON Formatter Options</h2>
        </div>
        <div class="links">
          <mjf-github-button></mjf-github-button>
          <mjf-ko-fi-button></mjf-ko-fi-button>
          <mjf-chrome-web-store-button></mjf-chrome-web-store-button>
        </div>
        <div class="separator"></div>
        <div class="section">
          <h2>Query history data</h2>
          <mjf-rounded-button @click=${this.onClearClick}>
            Clear
          </mjf-rounded-button>
        </div>
        ${until(
          this.content.then(domains => html`
                  <mjf-table-element .columns=${columns}
                                     .data=${domains}>
                  </mjf-table-element>
                `),
          html`<span>Loading...</span>`,
        )}
      </div>
    `;
  }

  private async onClearClick() {
    await clearHistory();
    this.content = getDomains();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mjf-options-page': OptionsPageElement;
  }
}
