import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { boxingFixCss } from '@core/styles/lit';
import { optionsSectionStyles } from '../section';
import type { DownloadMode } from '@core/settings';

export class ModeChangeEvent extends CustomEvent<DownloadMode> {
  constructor(mode: DownloadMode) {
    super('mode-change', { detail: mode, bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    'mode-change': ModeChangeEvent;
  }

  interface HTMLElementTagNameMap {
    'mjf-download-mode-section': DownloadModeSectionElement;
  }
}

@customElement('mjf-download-mode-section')
export class DownloadModeSectionElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    optionsSectionStyles,
    css`
      .radio-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .radio-group label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .radio-group input {
        margin-top: 2px;
        flex-shrink: 0;
      }
    `,
  ];

  @property({ type: String })
  public mode: DownloadMode = 'dropdown';

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  public override render() {
    return html`
      <div class="radio-group">
        <label>
          <input type="radio"
                 name="downloadMode"
                 value="dropdown"
                 .checked=${this.mode === 'dropdown'}
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
                 .checked=${this.mode === 'raw'}
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
                 .checked=${this.mode === 'formatted'}
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
                 .checked=${this.mode === 'minified'}
                 @change=${this.onRadioChange}>
          <div class="option-text">
            <span>Direct — Minified</span>
            <span class="option-hint">One click saves the JSON compacted into a single line with all whitespace removed.</span>
          </div>
        </label>
      </div>
    `;
  }

  private onRadioChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const mode = target.value as DownloadMode;
    this.mode = mode;
    this.dispatchEvent(new ModeChangeEvent(mode));
  }
}
