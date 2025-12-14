import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export class TabChangedEvent extends CustomEvent<TabType> {
  constructor(tab: TabType) {
    super('tab-changed', { detail: tab });
  }
}

declare global {
  interface HTMLElementEventMap {
    'tab-changed': TabChangedEvent;
  }

  interface HTMLElementTagNameMap {
    'mjf-toolbox': ToolboxElement;
  }
}

@customElement('mjf-toolbox')
export class ToolboxElement extends LitElement {
  public static override styles = css`
      :host {
          display: flex;
          flex-direction: row;
      }
  `;

  @property({ type: String, reflect: true })
  public tab: TabType = 'formatted';

  private readonly tabs: { tab: TabType, label: string }[] = [
    { tab: 'query', label: 'Query' },
    { tab: 'formatted', label: 'Formatted' },
    { tab: 'raw', label: 'Raw' },
  ];

  public override render() {
    const input = this.tab === 'query'
      ? html`<input/>`
      : ''

    return html`
        ${ input }
        ${ this.tabs.map(({ tab, label }) => html`
            <button @click=${ this.clickHandler } data-type=${ tab }>
                ${ label }
            </button>
        `) }
    `;
  }

  private clickHandler(args: MouseEvent) {
    const target = args.target as HTMLElement;
    this.tab = target.dataset.type as TabType;
    this.dispatchEvent(new TabChangedEvent(this.tab));
  }
}