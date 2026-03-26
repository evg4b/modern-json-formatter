import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { jq } from '@core/background';
import { boxingFixCss, buttonStylesCss } from '@core/styles/lit';
import type { ArrayNode, BooleanNode, ErrorNode, NullNode, NumberNode, ObjectNode, StringNode, TokenNode, TupleNode } from '@wasm/types';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-example-table': ExampleTableElement;
  }
}

const isErrorNode = (node: unknown): node is ErrorNode =>
  !!node && typeof node === 'object' && 'type' in node && (node as { type: unknown }).type === 'error';

const tokenNodeToJson = (node: TokenNode): unknown => {
  switch (node.type) {
    case 'null':    return null;
    case 'boolean': return node.value;
    case 'number':  return Number(node.value);
    case 'string':  return node.value;
    case 'object':  return Object.fromEntries((node as ObjectNode).properties.map(p => [p.key, tokenNodeToJson(p.value)]));
    case 'array':   return (node as ArrayNode).items.map(tokenNodeToJson);
  }
};

export const tokenNodeToString = (node: TokenNode | TupleNode): string => {
  switch (node.type) {
    case 'tuple':   return (node as TupleNode).items.map(tokenNodeToString).join('\n');
    case 'null':    return 'null';
    case 'boolean': return String((node as BooleanNode).value);
    case 'number':  return (node as NumberNode).value;
    case 'string':  return JSON.stringify((node as StringNode).value);
    case 'object':  return JSON.stringify(Object.fromEntries((node as ObjectNode).properties.map(p => [p.key, tokenNodeToJson(p.value)])));
    case 'array':   return JSON.stringify((node as ArrayNode).items.map(tokenNodeToJson));
  }
};

@customElement('mjf-example-table')
export class ExampleTableElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    buttonStylesCss,
    css`
      :host {
        display: block;
      }

      .wrapper {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .wrapper.static {
        cursor: pointer;
      }

      .wrapper.static:hover table {
        background: var(--code-background-hover, color-mix(in srgb, var(--code-background) 90%, white));
      }

      table {
        width: 100%;
        text-align: left;
        background: var(--code-background);
        padding: 10px;
        border-radius: 5px;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 5px 10px;
      }

      th {
        color: var(--meta-info-color);
        font-weight: 400;
        user-select: none;
        width: 65px;
      }

      td {
        font-family: monospace;
        font-weight: 400;
        color: var(--code-color);
      }

      input {
        width: 100%;
        background: var(--input-background);
        color: var(--input-color);
        border: 1px solid var(--input-border-color);
        border-radius: var(--input-border-radius, 4px);
        padding: 2px 6px;
        font-family: monospace;
        outline: none;
        box-sizing: border-box;

        &:focus {
          border-color: var(--input-focus-border-color);
        }
      }

      .controls {
        display: flex;
        flex-direction: row;
        gap: 8px;
        padding: 0 10px 5px;
        align-items: center;
      }

      .error-message {
        color: var(--error-color);
        font-size: 12px;
      }

      .loading {
        color: var(--meta-info-color);
        font-style: italic;
      }

      .hint {
        font-size: 11px;
        color: var(--meta-info-color);
        padding: 2px 10px 4px;
        user-select: none;
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
  private editMode = false;

  @state()
  private loading = false;

  @state()
  private result: string | null = null;

  @state()
  private error: string | null = null;

  private readonly queryRef = createRef<HTMLInputElement>();
  private readonly inputRef = createRef<HTMLInputElement>();

  public override render() {
    return this.editMode ? this.renderEditMode() : this.renderStaticMode();
  }

  private renderStaticMode() {
    return html`
      <div class="wrapper static" @click=${this.onActivate}>
        <table>
          <tbody>
            <tr><th>Query</th><td>${this.query}</td></tr>
            <tr><th>Input</th><td>${this.input}</td></tr>
            <tr><th>Output</th><td>${this.output}</td></tr>
          </tbody>
        </table>
        <div class="hint">Click to try interactively</div>
      </div>
    `;
  }

  private renderEditMode() {
    return html`
      <div class="wrapper">
        <table>
          <tbody>
            <tr>
              <th>Query</th>
              <td><input type="text" .value=${this.query} ${ref(this.queryRef)} /></td>
            </tr>
            <tr>
              <th>Input</th>
              <td><input type="text" .value=${this.input} ${ref(this.inputRef)} /></td>
            </tr>
            <tr>
              <th>Output</th>
              <td>${this.renderOutput()}</td>
            </tr>
          </tbody>
        </table>
        <div class="controls">
          <button @click=${this.onExec} ?disabled=${this.loading}>Exec</button>
          ${this.renderError()}
        </div>
      </div>
    `;
  }

  private renderOutput() {
    if (this.loading) {
      return html`<span class="loading">Running...</span>`;
    }
    if (this.result !== null) {
      return this.result;
    }
    return this.output;
  }

  private renderError() {
    if (!this.error) {
      return nothing;
    }
    return html`<span class="error-message">${this.error}</span>`;
  }

  private onActivate() {
    this.editMode = true;
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
