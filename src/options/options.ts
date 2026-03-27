import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { clearHistory, getDomains } from '@core/background';
import type { TableColumn } from '@core/ui/table';
import { until } from 'lit/directives/until.js';
import { boxingFixCss } from '@core/styles/lit';
import '@core/ui';

import './options.scss';
import { DEFAULT_SETTINGS, getSettings, saveSettings, type ExtensionSettings } from '@core/settings';

const columns: TableColumn[] = [
  { title: 'Domain', path: 'domain' },
  { title: 'Count', path: 'count' },
];

@customElement('mjf-options-page')
export class OptionsPageElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
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
        background: var(--border-color);
      }

      mjf-table-element {
        width: 100%;
      }

      .settings-section {
        width: 100%;
        margin-bottom: 10px;
      }

      .settings-section h3 {
        margin: 0 0 12px 0;
        font-size: 1rem;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .checkbox-group label,
      .radio-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .settings-section.disabled {
        opacity: 0.4;
        pointer-events: none;
      }
    `,
  ];

  @state()
  private content = getDomains();

  @state()
  private settings: ExtensionSettings = DEFAULT_SETTINGS;

  override async connectedCallback() {
    super.connectedCallback();
    this.settings = await getSettings();
  }

  public override render() {
    const downloadDisabled = !this.settings.buttons.download;

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

        <div class="settings-section">
          <h3>Toolbar Buttons</h3>
          <div class="checkbox-group">
            <label>
              <input type="checkbox"
                     .checked=${this.settings.buttons.query}
                     @change=${(e: Event) => this.onButtonToggle('query', (e.target as HTMLInputElement).checked)}>
              Query
            </label>
            <label>
              <input type="checkbox"
                     .checked=${this.settings.buttons.formatted}
                     @change=${(e: Event) => this.onButtonToggle('formatted', (e.target as HTMLInputElement).checked)}>
              Formatted
            </label>
            <label>
              <input type="checkbox"
                     .checked=${this.settings.buttons.raw}
                     @change=${(e: Event) => this.onButtonToggle('raw', (e.target as HTMLInputElement).checked)}>
              Raw
            </label>
            <label>
              <input type="checkbox"
                     .checked=${this.settings.buttons.download}
                     @change=${(e: Event) => this.onButtonToggle('download', (e.target as HTMLInputElement).checked)}>
              Download
            </label>
          </div>
        </div>

        <div class="separator"></div>

        <div class="settings-section ${downloadDisabled ? 'disabled' : ''}">
          <h3>Download Button Mode</h3>
          <div class="radio-group">
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="dropdown"
                     .checked=${this.settings.downloadMode === 'dropdown'}
                     @change=${() => this.onDownloadModeChange('dropdown')}>
              Show all options in a dropdown menu
            </label>
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="raw"
                     .checked=${this.settings.downloadMode === 'raw'}
                     @change=${() => this.onDownloadModeChange('raw')}>
              Directly download Raw file
            </label>
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="formatted"
                     .checked=${this.settings.downloadMode === 'formatted'}
                     @change=${() => this.onDownloadModeChange('formatted')}>
              Directly download Formatted file
            </label>
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="minified"
                     .checked=${this.settings.downloadMode === 'minified'}
                     @change=${() => this.onDownloadModeChange('minified')}>
              Directly download Minified file
            </label>
          </div>
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

  private async onButtonToggle(key: keyof ExtensionSettings['buttons'], value: boolean) {
    this.settings = {
      ...this.settings,
      buttons: { ...this.settings.buttons, [key]: value },
    };
    await saveSettings(this.settings);
  }

  private async onDownloadModeChange(mode: ExtensionSettings['downloadMode']) {
    this.settings = { ...this.settings, downloadMode: mode };
    await saveSettings(this.settings);
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
