import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { map } from 'lit/directives/map.js';
import { jq } from '@core/background';
import { boxingFixCss, buttonStylesCss } from '@core/styles/lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { TokenNode, TupleNode } from '@wasm/types';
import { isErrorNode } from '../../../content-script/helpers.ts';
import '@core/ui/error-message';

// ============ Types ============

type ExecutionState
  = | { type: 'idle' }
    | { type: 'loading' }
    | { type: 'success'; result: string }
    | { type: 'error'; error: string };

declare global {
  interface HTMLElementTagNameMap {
    'mjf-example-table': ExampleTableElement;
  }
}

// ============ Constants ============

const PLAY_ICON = `
  <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
    <path d="M3 2l10 6-10 6z"/>
  </svg>
`;

const ENTER_KEY = 'Enter';
const LOADING_MESSAGE = 'Running...';
const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error';
const RUN_QUERY_TITLE = 'Run query';

// ============ Utilities ============

/**
 * Converts a TokenNode or TupleNode into a JSON-like string representation.
 * Recursively traverses the token tree, handling:
 * - Primitives (null, boolean, number, string)
 * - Collections (object, array)
 * - Special tuple type (joins items with newlines for JQ multi-value results)
 */
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
  private executionState: ExecutionState = { type: 'idle' };

  private readonly queryRef = createRef<HTMLInputElement>();
  private readonly inputRef = createRef<HTMLInputElement>();

  // Convenience getters
  private get isLoading(): boolean {
    return this.executionState.type === 'loading';
  }

  private get currentError(): string | null {
    return this.executionState.type === 'error' ? this.executionState.error : null;
  }

  private get currentResult(): string | null {
    return this.executionState.type === 'success' ? this.executionState.result : null;
  }

  public override render() {
    return html`
      <div class="label">Query</div>
      <div class="row">
        <input
          ${ref(this.queryRef)}
          .value=${this.query}
          type="text"
          @keydown=${this.onKeyDown}
          ?disabled=${this.isLoading}
        />
        <button
          @click=${this.onExec}
          ?disabled=${this.isLoading}
          title=${RUN_QUERY_TITLE}
        >
          ${unsafeSVG(PLAY_ICON)}
        </button>
      </div>
      <div class="label">Input</div>
      <div>
        <input
          ${ref(this.inputRef)}
          .value=${this.input}
          type="text"
          @keydown=${this.onKeyDown}
          ?disabled=${this.isLoading}
        />
      </div>
      <div class="label">Output</div>
      <div class="code">
        ${this.renderContent()}
      </div>
    `;
  }

  private renderContent() {
    if (this.isLoading) {
      return LOADING_MESSAGE;
    }
    if (this.currentError) {
      return html`<mjf-error-message>${this.currentError}</mjf-error-message>`;
    }
    return this.renderOutputRows();
  }

  private renderOutputRows() {
    const lines = this.currentResult?.split('\n') ?? this.output.split('\n');
    return map(lines, line => html`
      <div>${line}</div>
    `);
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === ENTER_KEY && !this.isLoading) {
      void this.onExec();
    }
  }

  private async onExec() {
    const query = this.queryRef.value?.value ?? this.query;
    const input = this.inputRef.value?.value ?? this.input;

    this.executionState = { type: 'loading' };

    try {
      const response = await jq(input, query);
      const result = tokenNodeToString(response as TokenNode | TupleNode);
      this.executionState = { type: 'success', result };
    } catch (err: unknown) {
      const errorMessage = isErrorNode(err)
        ? err.error
        : err instanceof Error
          ? err.message
          : UNEXPECTED_ERROR_MESSAGE;

      this.executionState = { type: 'error', error: errorMessage };
    }
  }
}
