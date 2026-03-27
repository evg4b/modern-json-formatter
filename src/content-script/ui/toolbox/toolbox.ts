import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { isInstanceOf } from 'typed-assert';
import '../query-input';
import '../info-button';
import { map } from 'lit/directives/map.js';
import { boxingFixCss, buttonStylesCss } from '@core/styles/lit';
import { dropdown } from '@core/ui';
import downloadSvg from './download.svg?raw';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { DownloadMode, ToolbarButtonsSettings } from '@core/settings';

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

  @property({ type: Object })
  public buttons: ToolbarButtonsSettings = {
    query: true,
    formatted: true,
    raw: true,
    download: true,
  };

  @property({ type: String })
  public downloadMode: DownloadMode = 'dropdown';

  private readonly allTabs: { tab: TabType; label: string; key: keyof ToolbarButtonsSettings }[] = [
    { tab: 'query', label: 'Query', key: 'query' },
    { tab: 'formatted', label: 'Formatted', key: 'formatted' },
    { tab: 'raw', label: 'Raw', key: 'raw' },
  ];

  private readonly dropdownItems = [
    { label: 'Raw', onClick: () => this.dispatchEvent(new DownloadEvent('raw')) },
    { label: 'Formatted', onClick: () => this.dispatchEvent(new DownloadEvent('formatted')) },
    { label: 'Minified', onClick: () => this.dispatchEvent(new DownloadEvent('minified')) },
  ];

  public override render() {
    const visibleTabs = this.allTabs.filter(({ key }) => this.buttons[key]);

    const input = this.tab === 'query'
      ? html`<mjf-query-input .error=${this.error}></mjf-query-input>`
      : '';

    return html`
      ${input}
      <div class="button-container">
        ${map(visibleTabs, ({ tab, label }) => html`
          <button class=${classMap({ active: this.tab === tab })}
                  title=${label}
                  @click=${this.clickHandler}
                  data-type=${tab}>
            ${label}
          </button>
        `)}
        ${this.buttons.download ? this.renderDownloadButton() : ''}
      </div>
    `;
  }

  private renderDownloadButton() {
    if (this.downloadMode === 'dropdown') {
      return html`
        <button ${dropdown(this.dropdownItems)} class="square" title="Download">
          ${unsafeSVG(downloadSvg)}
        </button>
      `;
    }

    const type: DownloadType = this.downloadMode === 'formatted' ? 'formatted' : 'raw';
    const title = this.downloadMode === 'formatted' ? 'Download Formatted' : 'Download Raw';

    return html`
      <button class="square" title=${title}
              @click=${() => this.dispatchEvent(new DownloadEvent(type))}>
        ${unsafeSVG(downloadSvg)}
      </button>
    `;
  }

  private clickHandler(event: MouseEvent) {
    isInstanceOf(event.target, HTMLButtonElement);
    this.tab = event.target.dataset.type as TabType;
    this.dispatchEvent(new TabChangedEvent(this.tab));
  }
}
