import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { boxingFixCss } from '@core/styles/lit';
import { optionsSectionStyles } from '../section';
import type { ToolbarButtonsSettings } from '@core/settings';

export class ButtonsChangeEvent extends CustomEvent<ToolbarButtonsSettings> {
  constructor(buttons: ToolbarButtonsSettings) {
    super('buttons-change', { detail: buttons, bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    'buttons-change': ButtonsChangeEvent;
  }

  interface HTMLElementTagNameMap {
    'mjf-toolbar-buttons-section': ToolbarButtonsSectionElement;
  }
}

@customElement('mjf-toolbar-buttons-section')
export class ToolbarButtonsSectionElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    optionsSectionStyles,
    css`
      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .checkbox-group label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .checkbox-group input {
        margin-top: 2px;
        flex-shrink: 0;
      }
    `,
  ];

  @property({ type: Object })
  public buttons: ToolbarButtonsSettings = {
    query: true,
    formatted: true,
    raw: true,
    download: true,
  };

  public override render() {
    return html`
      <div class="checkbox-group">
        <label>
          <input type="checkbox"
                 data-key="query"
                 .checked=${this.buttons.query}
                 @change=${this.onCheckboxChange}>
          <div class="option-text">
            <span>Query</span>
            <span class="option-hint">Opens the JQ query panel to filter and transform the JSON using jq expressions.</span>
          </div>
        </label>
        <label>
          <input type="checkbox"
                 data-key="formatted"
                 .checked=${this.buttons.formatted}
                 @change=${this.onCheckboxChange}>
          <div class="option-text">
            <span>Formatted</span>
            <span class="option-hint">Shows the JSON with syntax highlighting, collapsible nodes, and indentation.</span>
          </div>
        </label>
        <label>
          <input type="checkbox"
                 data-key="raw"
                 .checked=${this.buttons.raw}
                 @change=${this.onCheckboxChange}>
          <div class="option-text">
            <span>Raw</span>
            <span class="option-hint">Shows the original unmodified JSON exactly as received from the server.</span>
          </div>
        </label>
        <label>
          <input type="checkbox"
                 data-key="download"
                 .checked=${this.buttons.download}
                 @change=${this.onCheckboxChange}>
          <div class="option-text">
            <span>Download</span>
            <span class="option-hint">Adds a download button to save the current JSON to a file.</span>
          </div>
        </label>
      </div>
    `;
  }

  private onCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const key = target.dataset.key as keyof ToolbarButtonsSettings;
    const updated: ToolbarButtonsSettings = { ...this.buttons, [key]: target.checked };
    this.buttons = updated;
    this.dispatchEvent(new ButtonsChangeEvent(updated));
  }
}
