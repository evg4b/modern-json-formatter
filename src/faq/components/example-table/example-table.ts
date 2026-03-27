import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { map } from 'lit/directives/map.js';
import { jq } from '@core/background';
import { boxingFixCss, buttonStylesCss } from '@core/styles/lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { TokenNode, TupleNode } from '@wasm/types';
import '../example-error/example-error';
import { isErrorNode } from '../../../content-script/helpers.ts';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-example-table': ExampleTableElement;
  }
}

const PLAY_ICON = `
  <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
    <path d="M3 2l10 6-10 6z"/>
  </svg>
`;

export const tokenNodeToString = (node: TokenNode | TupleNode): string => {
  switch (node.type) {
    case 'tuple':
      return node.items
        .map(tokenNodeToString)
        .join('\n');
    case 'null':
      return 'null';
    case 'boolean':
      return String(node.value);
    case 'number':
      return node.value;
    case 'string':
      return JSON.stringify(node.value);
    case 'object': {
      const properties = node.properties.map(p => `"${p.key}": ${tokenNodeToString(p.value)}`)
        .join(', ');

      return `{${properties}}`;
    }
    case 'array': {
      const items = node.items.map(tokenNodeToString)
        .join(', ');

      return `[${items}]`;
    }
  }
};

@customElement('mjf-example-table')
export class ExampleTableElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    buttonStylesCss,
    css`
      :host {
        display: grid;
        grid-template-columns: auto 3fr;
        padding: 10px;
        gap: 4px 10px;
        background: var(--code-background);
        border-radius: 5px;
        overflow: hidden;
        position: relative;
      }

      .label {
        color: var(--meta-info-color);
        font-weight: 400;
        user-select: none;
      }

      .wrapper {
        position: relative;
        cursor: pointer;
      }

      .wrapper.edit {
        cursor: default;
      }

      .code, input {
        color: var(--code-color);
        font-family: monospace;
        font-weight: 400;
        font-size: 15px;
        line-height: 1.5;
      }

      button {
        opacity: 0;
        display: flex;
        width: 24px;
        height: 24px;
        min-width: auto;
        border: none;
        border-radius: 100%;
        box-sizing: border-box;
        padding: 0;
        align-items: center;
        justify-content: center;
        max-width: 24px;
        max-height: 24px;
        flex-shrink: 0;
        background: transparent;
        
        svg {
          margin-left: 2px;
        }
        
        &:hover {
          background: var(--border-color);
        }
      }
      
      :host(:hover) button {
        opacity: 1;
      }

      input {
        background: transparent;
        border: none;
        outline: none;
        width: 100%;
        padding: 0;
        display: block;
        border: none;
      }
      
      .row {
        display: flex;
        flex-direction: row;
      }

      .loading {
        color: var(--meta-info-color);
        font-style: italic;
      }

      .container {
        display: grid;
      }
    `,
  ];

  @property({ type: String })
  public query = '';

  @property({ type: String })
  public input = '';

  @property({ type: String })
  public output = '';

  @state()
  private loading = false;

  @state()
  private result: string | null = null;

  @state()
  private error: string | null = null;

  private readonly queryRef = createRef<HTMLInputElement>();
  private readonly inputRef = createRef<HTMLInputElement>();

  public override render() {
    const outputLines = this.result?.split('\n') ?? this.output.split('\n');

    return html`
      <div class="label">Query</div>
      <div class="row">
        <input ${ref(this.queryRef)} .value=${this.query} type="text" @keydown=${this.onKeyDown} />
        <button @click=${this.onExec} .disabled=${this.loading} title="Run query">
          ${unsafeSVG(PLAY_ICON)}
        </button>
      </div>
      <div class="label">Input</div>
      <div>
        <input ${ref(this.inputRef)} .value=${this.input} type="text" @keydown=${this.onKeyDown} />
      </div>
      <div class="label">Output</div>
      <div class="code">
        ${this.error ? this.renderErrorRow() : this.renderOutputRows(outputLines)}
      </div>
    `;
  }

  private renderOutputRows(lines: string[]) {
    if (this.loading) {
      return 'Running...';
    }

    return map(lines, line => html`
      <div>${line}</div>
    `);
  }

  private renderErrorRow() {
    return html`
      <mjf-example-error message=${this.error!}></mjf-example-error>
    `;
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.loading) {
      void this.onExec();
    }
  }

  private async onExec() {
    this.loading = true;
    this.error = null;
    this.result = null;
    const query = this.queryRef.value?.value ?? this.query;
    const input = this.inputRef.value?.value ?? this.input;
    try {
      const response = await jq(input, query);
      this.result = tokenNodeToString(response as TokenNode | TupleNode);
    } catch (err: unknown) {
      this.error = isErrorNode(err) ? err.error : 'Unexpected error';
    } finally {
      this.loading = false;
    }
  }
}
