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
        margin: 0 0 4px 0;
        font-size: 1rem;
      }

      .section-hint {
        margin: 0 0 14px 0;
        font-size: 0.82rem;
        color: var(--meta-info-color);
        line-height: 1.4;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .checkbox-group label,
      .radio-group label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .checkbox-group input,
      .radio-group input {
        margin-top: 2px;
        flex-shrink: 0;
      }

      .option-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .option-hint {
        font-size: 0.78rem;
        color: var(--meta-info-color);
        line-height: 1.4;
      }

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
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

  override firstUpdated() {
    void getSettings().then(settings => {
      this.settings = settings;
    });
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
          <p class="section-hint">Choose which buttons appear in the toolbar when viewing a JSON page.</p>
          <div class="checkbox-group">
            <label>
              <input type="checkbox"
                     data-key="query"
                     .checked=${this.settings.buttons.query}
                     @change=${this.onButtonCheckboxChange}>
              <div class="option-text">
                <span>Query</span>
                <span class="option-hint">Opens the JQ query panel to filter and transform the JSON using jq expressions.</span>
              </div>
            </label>
            <label>
              <input type="checkbox"
                     data-key="formatted"
                     .checked=${this.settings.buttons.formatted}
                     @change=${this.onButtonCheckboxChange}>
              <div class="option-text">
                <span>Formatted</span>
                <span class="option-hint">Shows the JSON with syntax highlighting, collapsible nodes, and indentation.</span>
              </div>
            </label>
            <label>
              <input type="checkbox"
                     data-key="raw"
                     .checked=${this.settings.buttons.raw}
                     @change=${this.onButtonCheckboxChange}>
              <div class="option-text">
                <span>Raw</span>
                <span class="option-hint">Shows the original unmodified JSON exactly as received from the server.</span>
              </div>
            </label>
            <label>
              <input type="checkbox"
                     data-key="download"
                     .checked=${this.settings.buttons.download}
                     @change=${this.onButtonCheckboxChange}>
              <div class="option-text">
                <span>Download</span>
                <span class="option-hint">Adds a download button to save the current JSON to a file.</span>
              </div>
            </label>
          </div>
        </div>

        <div class="separator"></div>

        <div class="settings-section ${downloadDisabled ? 'disabled' : ''}">
          <h3>Download Button Mode</h3>
          <p class="section-hint">Controls what happens when you click the download button.</p>
          <div class="radio-group">
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="dropdown"
                     .checked=${this.settings.downloadMode === 'dropdown'}
                     @change=${this.onRadioChange}>
              <div class="option-text">
                <span>Dropdown menu</span>
                <span class="option-hint">Clicking the button opens a menu letting you choose between Raw, Formatted, or Minified on each download.</span>
              </div>
            </label>
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="raw"
                     .checked=${this.settings.downloadMode === 'raw'}
                     @change=${this.onRadioChange}>
              <div class="option-text">
                <span>Direct — Raw</span>
                <span class="option-hint">One click saves the original JSON exactly as received from the server, without any changes.</span>
              </div>
            </label>
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="formatted"
                     .checked=${this.settings.downloadMode === 'formatted'}
                     @change=${this.onRadioChange}>
              <div class="option-text">
                <span>Direct — Formatted</span>
                <span class="option-hint">One click saves the JSON with consistent indentation and guaranteed key ordering.</span>
              </div>
            </label>
            <label>
              <input type="radio"
                     name="downloadMode"
                     value="minified"
                     .checked=${this.settings.downloadMode === 'minified'}
                     @change=${this.onRadioChange}>
              <div class="option-text">
                <span>Direct — Minified</span>
                <span class="option-hint">One click saves the JSON compacted into a single line with all whitespace removed.</span>
              </div>
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

  private async onButtonCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const key = target.dataset.key as keyof ExtensionSettings['buttons'];
    this.settings = {
      ...this.settings,
      buttons: { ...this.settings.buttons, [key]: target.checked },
    };
    await saveSettings(this.settings);
  }

  private async onRadioChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.settings = { ...this.settings, downloadMode: target.value as ExtensionSettings['downloadMode'] };
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
