import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { map } from 'lit/directives/map.js';
import { jq } from '@core/background';
import { boxingFixCss, buttonStylesCss } from '@core/styles/lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ArrayNode, BooleanNode, ErrorNode, NumberNode, ObjectNode, StringNode, TokenNode, TupleNode } from '@wasm/types';
import '../example-error/example-error';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-example-table': ExampleTableElement;
  }
}

const PLAY_ICON = `<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
  <path d="M3 2l10 6-10 6z"/>
</svg>`;

const isErrorNode = (node: unknown): node is ErrorNode => !!node && typeof node === 'object' && 'type' in node && (node as { type: unknown }).type === 'error';

const tokenNodeToJson = (node: TokenNode): unknown => {
  switch (node.type) {
    case 'null': return null;
    case 'boolean': return node.value;
    case 'number': return Number(node.value);
    case 'string': return node.value;
    case 'object': return Object.fromEntries((node as ObjectNode).properties.map(p => [p.key, tokenNodeToJson(p.value)]));
    case 'array': return (node as ArrayNode).items.map(tokenNodeToJson);
  }
};

export const tokenNodeToString = (node: TokenNode | TupleNode): string => {
  switch (node.type) {
    case 'tuple': return (node as TupleNode).items.map(tokenNodeToString).join('\n');
    case 'null': return 'null';
    case 'boolean': return String((node as BooleanNode).value);
    case 'number': return (node as NumberNode).value;
    case 'string': return JSON.stringify((node as StringNode).value);
    case 'object': return JSON.stringify(Object.fromEntries((node as ObjectNode).properties.map(p => [p.key, tokenNodeToJson(p.value)])));
    case 'array': return JSON.stringify((node as ArrayNode).items.map(tokenNodeToJson));
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
        position: relative;
        cursor: pointer;
      }

      .wrapper.edit {
        cursor: default;
      }

      table {
        width: 100%;
        text-align: left;
        background: var(--code-background);
        padding: 10px 10px;
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
        white-space: pre-line;
      }

      input {
        background: transparent;
        border: none;
        border-bottom: 1px solid transparent;
        outline: none;
        color: var(--code-color);
        font-family: monospace;
        font-weight: 400;
        font-size: inherit;
        width: 100%;
        padding: 0;
        display: block;

        &:focus {
          border-bottom-color: var(--input-focus-border-color, var(--input-border-color));
        }
      }

      .play-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        border-radius: 4px;
        background: var(--meta-info-color);
        color: var(--code-background);
        cursor: pointer;
        opacity: 0.7;
        line-height: 1;

        &:hover {
          opacity: 1;
        }

        &:disabled {
          opacity: 0.4;
          cursor: default;
        }
      }

      .loading {
        color: var(--meta-info-color);
        font-style: italic;
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
    const outputLines = this.output.split('\n');
    return html`
      <div class="wrapper" @click=${this.onActivate}>
        <table>
          <tbody>
            <tr><th>Query</th><td>${this.query}</td></tr>
            <tr><th>Input</th><td>${this.input}</td></tr>
            ${this.renderOutputRows(outputLines)}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderEditMode() {
    const outputLines = this.result?.split('\n') ?? this.output.split('\n');
    return html`
      <div class="wrapper edit">
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
            ${this.error ? this.renderErrorRow() : this.renderOutputRows(outputLines)}
          </tbody>
        </table>
        <button
          class="play-btn"
          @click=${this.onExec}
          ?disabled=${this.loading}
          title="Run query"
        >${unsafeSVG(PLAY_ICON)}</button>
      </div>
    `;
  }

  private renderOutputRows(lines: string[]) {
    return map(lines, (line, i) => html`
      <tr>
        <th>${i === 0 ? 'Output' : ''}</th>
        <td class=${this.loading && i === 0 ? 'loading' : ''}>${this.loading && i === 0 ? 'Running…' : line}</td>
      </tr>
    `);
  }

  private renderErrorRow() {
    return html`
      <tr>
        <th>Error</th>
        <td><mjf-example-error message=${this.error!}></mjf-example-error></td>
      </tr>
    `;
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
