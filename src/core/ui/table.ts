import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { get } from 'es-toolkit/compat';
import { map } from 'lit/directives/map.js';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-table-element': TableElement;
  }
}

export interface TableColumn {
  title: string;
  path: string;
}

@customElement('mjf-table-element')
export class TableElement extends LitElement {
  public static override readonly styles = css`
    :host {
      --v-margin: 1em;
      --h-margin: 0;
      --table-border: 1px solid #636363;

      display: flex;
      flex-direction: column;

      table {
        margin: var(--v-margin) var(--h-margin);
        width: 100%;
        border: var(--table-border);
        border-collapse: collapse;
      }

      th,
      td {
        font-weight: normal;
        text-align: left;
        padding: 0.3em 0.3em;
        border: var(--table-border);
        border-collapse: collapse;
      }

      th {
        background-color: #3c3c3c;
        user-select: none;
      }

      .empty {
        text-align: center;
        user-select: none;
        color: #757575;
      }

    }
  `;

  @property({ type: Array })
  public columns: TableColumn[] = [];

  @property({ type: Array })
  public data: unknown[] = [];

  public override render() {
    return html`
      <table>
        <thead>
        <tr>
          ${map(this.columns, col => html`
            <th>${col.title}</th>
          `)}
        </tr>
        </thead>
        <tbody>
        ${this.renderRows(this.data)}
        </tbody>
      </table>
    `;
  }

  private renderRows(data: unknown[]) {
    if (data.length === 0) {
      return html`
        <tr>
          <td class="empty" colspan=${this.columns.length}>
            No rows
          </td>
        </tr>
      `;
    }

    return html`
      ${map(data, row => html`
        <tr>
          ${map(this.columns, col => html`
            <td>
              ${get(row, col.path, 'N/A')}
            </td>
          `)}
        </tr>
      `)}
    `;
  }
}
