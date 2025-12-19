import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { isInstanceOf } from 'typed-assert';
import '../query-input'
import '../info-button';
import '@core/ui/button'
import { ButtonElement } from "@core/ui/button";

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
      justify-content: space-between;
      margin-bottom: 10px;
      gap: 10px;
    }

    .button-container {
        display: flex;
        flex-direction: row;
        gap: 5px;
    }
  `;

  @property({ type: String, reflect: true })
  public tab: TabType = 'formatted';

  @property({ type: String })
  public error: string | null = null;

  private readonly tabs: { tab: TabType, label: string }[] = [
    { tab: 'query', label: 'Query' },
    { tab: 'formatted', label: 'Formatted' },
    { tab: 'raw', label: 'Raw' },
  ];

  public override render() {
    const input = this.tab === 'query'
      ? html`<mjf-query-input .error=${ this.error }></mjf-query-input>`
      : '';

    return html`
        ${ input }
        <div class="button-container">
          ${ this.tabs.map(({ tab, label }) => html`
            <mjf-button class=${ classMap({ active: this.tab === tab }) }
                        @click=${ this.clickHandler }
                        .active=${ this.tab === tab }
                        data-type=${ tab }>
                ${ label }
            </mjf-button>
          `) }
        </div>
    `;
  }

  private clickHandler(event: MouseEvent) {
    isInstanceOf(event.target, ButtonElement)
    this.tab = event.target.dataset.type as TabType;
    this.dispatchEvent(new TabChangedEvent(this.tab));
  }
}