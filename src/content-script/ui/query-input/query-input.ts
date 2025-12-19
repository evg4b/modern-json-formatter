import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref, createRef } from 'lit/directives/ref.js';
import './error-message.ts';
import { isRedoEvent, isSubmitEvent, isUndoEvent, isWrapEvent } from '../query-input-old/query-input.helpers.ts';
import { isNotNil, throws } from '../../helpers.ts';
import { HistoryManager } from '../query-input-old/history-manager.ts';
import { resource } from '@core/browser';
import { AutocompleteController } from './autocomplete.controller.ts';

interface HistoryItem {
  query: string;
  start: number | null;
  end: number | null;
}

export const brackets: Record<string, string> = {
  '[': ']',
  '(': ')',
  '{': '}',
  '\'': '\'',
  '"': '"',
  '`': '`',
};

export class JqQueryEvent extends CustomEvent<string> {
  constructor(query: string) {
    super('jq-query', { detail: query, bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    'jq-query': JqQueryEvent;
  }

  interface HTMLElementTagNameMap {
    'mjf-query-input': QueryInputElement;
  }
}

@customElement('mjf-query-input')
export class QueryInputElement extends LitElement {
  public static override styles = css`
    :host {
      display: flex;
      flex-direction: row;
      gap: 5px;
    }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 3px;
      position: relative;
    }

    input {
      min-width: 200px;
      min-height: 24px;
      width: 30vw;
      background: var(--input-background);
      color: var(--input-color);
      border: 1px solid var(--input-border-color);
      border-radius: var(--input-border-radius);
      padding: 0 5px;
      outline: none;
      transition-property: border-color, background, color;
      transition-duration: 0.2s;
      transition-timing-function: ease-in-out;
      flex: 1 1 auto;
      box-sizing: border-box;

      &:hover {
        background: var(--input-hover-background);
        color: var(--input-hover-color);
        border-color: var(--input-hover-border-color);
      }

      &:focus, &:focus-visible {
        background: var(--input-focus-background);
        color: var(--input-focus-color);
        border-color: var(--input-focus-border-color);
      }
    }
  `;

  @property({ type: String })
  public error: string | null = null;

  private readonly historyManager = new HistoryManager<HistoryItem>();
  private readonly autocomplete = new AutocompleteController(this, window.location.hostname);

  private readonly inputRef = createRef<HTMLInputElement>();

  private get inputElement() {
    return this.inputRef.value ?? throws('input element is not defined');
  }

  private readonly url = resource('faq.html');

  public override render() {
    return html`
      <mjf-info-button .url=${this.url}></mjf-info-button>
      <div class="input-wrapper">
        <input type="text"
               placeholder="Input jq query..."
               list="history-list"
               @keydown=${this.onKeydown}
               @input=${this.onInput}
               ${ref(this.inputRef)}
        />
        <datalist id="history-list">
          ${this.autocomplete.options.map(query => html`
              <option value="${query}">${query}</option>
          `)}
        </datalist>
        ${this.renderError()}
      </div>
    `;
  }

  public override firstUpdated() {
    this.inputElement.focus();
  }

  private renderError() {
    if (!this.error) {
      return '';
    }

    return html`
      <mjf-error-message>
        ${this.error}
      </mjf-error-message>
    `;
  }

  private onKeydown(event: KeyboardEvent) {
    this.error = null;
    if (isSubmitEvent(event)) {
      this.dispatchEvent(new JqQueryEvent(this.inputElement.value));
    } else if (isWrapEvent(event, brackets)) {
      this.onWrapEvent(event);
    } else if (isUndoEvent(event)) {
      this.onUndoEvent(event);
    } else if (isRedoEvent(event)) {
      this.onRedoEvent(event);
    }
  }

  private onInput() {
    this.saveState();
    void this.autocomplete.updateHistory(this.inputElement.value);
  }

  private onWrapEvent(event: KeyboardEvent) {
    const start = this.inputElement.selectionStart ?? 0;
    const end = this.inputElement.selectionEnd ?? 0;
    if (isNotNil(start) && isNotNil(end) && start !== end) {
      event.preventDefault();
      const selectedText = this.inputElement.value.substring(start, end);
      this.inputElement.setRangeText(`${event.key}${selectedText}${brackets[event.key]}`);
      this.inputElement.setSelectionRange(start + 1, end + 1);
      this.saveState();
    }
  }

  private onUndoEvent(event: KeyboardEvent) {
    event.preventDefault();
    const previousState = this.historyManager.undo();
    this.restoreState(previousState);
  }

  private onRedoEvent(event: KeyboardEvent) {
    event.preventDefault();
    const nextState = this.historyManager.redo();
    this.restoreState(nextState);
  }

  private saveState() {
    this.historyManager.save({
      query: this.inputElement.value,
      start: this.inputElement.selectionStart,
      end: this.inputElement.selectionEnd,
    });
  }

  private restoreState(state: HistoryItem | null) {
    if (state) {
      this.inputElement.value = state.query;
      this.inputElement.setSelectionRange(state.start, state.end);
    }
  }
}
