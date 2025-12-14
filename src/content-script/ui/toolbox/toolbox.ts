import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

export class TabChangedEvent extends CustomEvent<TabType> {
  constructor(tab: TabType) {
    super('tab-changed', { detail: tab });
  }
}

declare global {
  interface HTMLElementEventMap {
    'tab-changed': TabChangedEvent;
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

  public override render() {
    return html`
        <button @click=${ this.clickHandler } data-type="query">
            Query
        </button>
        <button @click=${ this.clickHandler } data-type="formated">
            Formated
        </button>
        <button @click=${ this.clickHandler } data-type="raw">
            Raw
        </button>
    `;
  }

  private clickHandler(args: MouseEvent) {
    const target = args.target as HTMLElement;
    this.dispatchEvent(new TabChangedEvent(target.dataset.type as TabType));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mjf-toolbox': ToolboxElement;
  }
}
