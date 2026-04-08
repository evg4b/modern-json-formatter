import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { boxingFixCss } from '@core/styles/lit';
import { optionsSectionStyles } from '../section';
import { MAX_FILE_SIZE_MB, MIN_FILE_SIZE_MB } from '@core/settings';

export class FileSizeChangeEvent extends CustomEvent<number> {
  constructor(value: number) {
    super('file-size-change', { detail: value, bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    'file-size-change': FileSizeChangeEvent;
  }

  interface HTMLElementTagNameMap {
    'mjf-file-size-section': FileSizeSectionElement;
  }
}

@customElement('mjf-file-size-section')
export class FileSizeSectionElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    optionsSectionStyles,
    css`
      .range-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .range-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      input[type='range'] {
        flex: 1;
        cursor: pointer;
      }

      .value-label {
        min-width: 48px;
        text-align: right;
        font-weight: 600;
      }

      .bounds {
        display: flex;
        justify-content: space-between;
        font-size: 0.8em;
        opacity: 0.6;
      }
    `,
  ];

  @property({ type: Number, attribute: 'max-file-size' })
  public maxFileSize = 3;

  public override render() {
    return html`
      <div class="range-wrapper">
        <div class="range-row">
          <input
            type="range"
            min=${MIN_FILE_SIZE_MB}
            max=${MAX_FILE_SIZE_MB}
            step="1"
            .value=${String(this.maxFileSize)}
            @input=${this.onRangeInput}
          />
          <span class="value-label">${this.maxFileSize} MB</span>
        </div>
        <div class="bounds">
          <span>${MIN_FILE_SIZE_MB} MB</span>
          <span>${MAX_FILE_SIZE_MB} MB</span>
        </div>
      </div>
    `;
  }

  private onRangeInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    this.maxFileSize = value;
    this.dispatchEvent(new FileSizeChangeEvent(value));
  }
}
