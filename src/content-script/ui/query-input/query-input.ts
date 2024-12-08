import { getURL } from '@core/browser';
import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import { isNotNil } from '../../helpres';
import { InfoButtonElement } from '../info-button';
import { HistoryManager } from './history-manager';
import { isRedoEvent, isSubmitEvent, isUndoEvent, isWrapEvent } from './query-input.helpres';
import queryInputStyles from './query-input.module.scss';

const brackets: Record<string, string> = {
  '[': ']',
  '(': ')',
  '{': '}',
  "'": "'",
  '"': '"',
  '`': '`',
};

interface HistoryItem {
  query: string;
  start: number | null;
  end: number | null;
}

@CustomElement('query-input')
export class QueryInputElement extends StyledComponentElement {
  private readonly input = this.createInput();
  private readonly errorMessage = this.createErrorMessage();
  private readonly wrapper = createElement({
    element: 'div',
    class: 'input-wrapper',
    children: [this.input, this.errorMessage],
  });

  private readonly infoIcons = new InfoButtonElement(getURL('faq.html'));

  private onSubmitCallback: ((s: string) => unknown) | null = null;
  private history = new HistoryManager<HistoryItem>();

  constructor() {
    super(queryInputStyles);
    this.shadow.append(this.infoIcons, this.wrapper);
    this.setupEventHandlers(this.input);
    this.saveState();
  }

  public setErrorMessage(errorMessage: string | null): void {
    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
      this.errorMessage.classList.remove('hidden');
    } else {
      this.errorMessage.textContent = '';
      this.errorMessage.classList.add('hidden');
    }
  }

  public onSubmit(callback: (s: string) => void | Promise<void>): void {
    this.onSubmitCallback = callback;
  }

  public focus(): void {
    this.input.focus();
  }

  public blur(): void {
    this.input.blur();
  }

  public hide(): void {
    this.style.display = 'none';
  }

  public show(): void {
    this.style.display = 'flex';
  }

  private createInput(): HTMLInputElement {
    const input = createElement({ element: 'input' });
    input.type = 'text';
    input.placeholder = 'Input jq query...';

    return input;
  }

  private createErrorMessage(): HTMLSpanElement {
    const errorMessage = document.createElement('span');
    errorMessage.classList.add('error-message', 'hidden');
    return errorMessage;
  }

  private setupEventHandlers(input: HTMLInputElement) {
    input.addEventListener('keydown', event => {
      this.setErrorMessage(null);
      if (isSubmitEvent(event)) {
        this.onSubmitEvent(event);
      }
      if (isWrapEvent(event, brackets)) {
        this.onWrapEvent(event);
      }
      if (isUndoEvent(event)) {
        this.onUndoEvent(event);
      }
      if (isRedoEvent(event)) {
        this.onRedoEvent(event);
      }
    });

    input.addEventListener('input', this.saveState.bind(this));
  }

  private onSubmitEvent(_: KeyboardEvent) {
    this.onSubmitCallback?.(this.input.value);
  }

  private onWrapEvent(event: KeyboardEvent) {
    const start = this.input.selectionStart ?? 0;
    const end = this.input.selectionEnd ?? 0;
    if (isNotNil(start) && isNotNil(end) && start !== end) {
      event.preventDefault();
      this.saveState();
      const selectedText = this.input.value.substring(start, end);
      this.input.setRangeText(`${event.key}${selectedText}${brackets[event.key]}`);
      this.input.setSelectionRange(start + 1, end + 1);
    }
  }

  private onUndoEvent(event: KeyboardEvent) {
    event.preventDefault();
    const previousState = this.history.undo();
    this.restoreState(previousState);
  }

  private onRedoEvent(event: KeyboardEvent) {
    event.preventDefault();
    const nextState = this.history.redo();
    this.restoreState(nextState);
  }

  private saveState() {
    this.history.save({
      query: this.input.value,
      start: this.input.selectionStart,
      end: this.input.selectionEnd,
    });
  }

  private restoreState(state: HistoryItem | null) {
    if (state) {
      this.input.value = state.query;
      this.input.setSelectionRange(state.start, state.end);
    }
  }
}
