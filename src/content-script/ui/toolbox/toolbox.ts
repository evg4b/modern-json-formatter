import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { isInstanceOf } from 'typed-assert';
import '../query-input';
import '../info-button';
import '../dropdown';
import { map } from 'lit/directives/map.js';
import { boxingFixCss, buttonStylesCss } from '@core/styles/lit';
import { createDropdown } from '../dropdown';
import downloadSvg from './download.svg?raw';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

export class TabChangedEvent extends CustomEvent<TabType> {
  constructor(tab: TabType) {
    super('tab-changed', { detail: tab });
  }
}

export type DownloadType = 'raw' | 'formatted' | 'minified';

export class DownloadEvent extends CustomEvent<DownloadType> {
  constructor(type: DownloadType) {
    super('download', { detail: type });
  }
}

declare global {
  interface HTMLElementEventMap {
    'tab-changed': TabChangedEvent;
    'download': DownloadEvent;
  }

  interface HTMLElementTagNameMap {
    'mjf-toolbox': ToolboxElement;
  }
}

@customElement('mjf-toolbox')
export class ToolboxElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    buttonStylesCss,
    css`
      :host {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 10px;
        gap: 10px;
      }

      .button-container {
        display: flex;
        flex-direction: row;
        gap: 5px;
      }
      
      svg {
        width: 18px;
        height: 18px;
        display: inline-block;
        margin-top: -3px;
        margin-bottom: -4px;
      }
    `,
  ];

  @property({ type: String, reflect: true })
  public tab: TabType = 'formatted';

  @property({ type: String })
  public error: string | null = null;

  private readonly tabs: { tab: TabType; label: string }[] = [
    { tab: 'query', label: 'Query' },
    { tab: 'formatted', label: 'Formatted' },
    { tab: 'raw', label: 'Raw' },
  ];

  private readonly dropdown = createDropdown([
    { label: 'Raw', onClick: () => this.dispatchEvent(new DownloadEvent('raw')) },
    { label: 'Formatted', onClick: () => this.dispatchEvent(new DownloadEvent('formatted')) },
    { label: 'Minified', onClick: () => this.dispatchEvent(new DownloadEvent('minified')) },
  ]);

  public override render() {
    const input = this.tab === 'query'
      ? html`<mjf-query-input .error=${this.error}></mjf-query-input>`
      : '';

    return html`
      ${input}
      <div class="bcutton-container">
        ${map(this.tabs, ({ tab, label }) => html`
          <button class=${classMap({ active: this.tab === tab })}
                      @click=${this.clickHandler}
                      data-type=${tab}>
            ${label}
          </button>
        `)}
        <mjf-button demo=${this.dropdown.id}>
          ${unsafeSVG(downloadSvg)}
        </mjf-button>
        ${this.dropdown.element}
      </div>
    `;
  }

  private clickHandler(event: MouseEvent) {
    isInstanceOf(event.target, HTMLButtonElement);
    this.tab = event.target.dataset.type as TabType;
    this.dispatchEvent(new TabChangedEvent(this.tab));
  }
}
