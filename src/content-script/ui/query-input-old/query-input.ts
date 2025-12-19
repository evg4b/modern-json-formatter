import { getHistory } from '@core/background';
import { resource } from '@core/browser';
import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import { debounce } from 'es-toolkit';
import { isNotNil } from '../../helpers';
import { HistoryManager } from './history-manager';
import { isRedoEvent, isSubmitEvent, isUndoEvent, isWrapEvent } from './query-input.helpers';
import queryInputStyles from './query-input.styles';

export const brackets: Record<string, string> = {
  '[': ']',
  '(': ')',
  '{': '}',
  '\'': '\'',
  '"': '"',
  '`': '`',
};

interface HistoryItem {
  query: string;
  start: number | null;
  end: number | null;
}

@CustomElement('query-input-old')
export class QueryInputElement extends StyledComponentElement {
  private readonly inputElement = this.createInput();
  private readonly errorMessageElement = createElement({
    element: 'span',
    class: ['error-message', 'hidden'],
  });

  private readonly historyList = createElement({
    element: 'datalist',
    id: 'history-list',
  });

  private readonly wrapperElement = createElement({
    element: 'div',
    class: 'input-wrapper',
    children: [
      this.inputElement,
      this.errorMessageElement,
      this.historyList,
    ],
  });

  private readonly infoIcons = createElement({
    element: 'mjf-info-button',
    attributes: { url: resource('faq.html') },
  });

  private readonly history = new HistoryManager<HistoryItem>();

  private onSubmitCallback: ((s: string) => unknown) | null = null;

  constructor() {
    super(queryInputStyles);
    this.shadow.append(this.infoIcons, this.wrapperElement);
    this.setupEventHandlers(this.inputElement);
    this.saveState();
    void this.loadHistory('');
  }

  public setErrorMessage(errorMessage: string | null): void {
    if (errorMessage) {
      this.errorMessageElement.textContent = errorMessage;
      this.errorMessageElement.classList.remove('hidden');
    }
    else {
      this.errorMessageElement.textContent = '';
      this.errorMessageElement.classList.add('hidden');
    }
  }

  public onSubmit(callback: (s: string) => void | Promise<void>): void {
    this.onSubmitCallback = callback;
  }

  public override focus(): void {
    this.inputElement.focus();
  }

  public override blur(): void {
    this.inputElement.blur();
  }

  public hide(): void {
    this.style.display = 'none';
  }

  public show(): void {
    this.style.display = 'flex';
  }

  private createInput(): HTMLInputElement {
    const input = createElement({
      element: 'input',
      attributes: {
        list: 'history-list',
      },
    });
    input.type = 'text';
    input.placeholder = 'Input jq query...';

    return input;
  }

  private setupEventHandlers(input: HTMLInputElement) {
    input.addEventListener('keydown', (event) => {
      this.setErrorMessage(null);
      if (isSubmitEvent(event)) {
        this.onSubmitEvent();
      }
      else if (isWrapEvent(event, brackets)) {
        this.onWrapEvent(event);
      }
      else if (isUndoEvent(event)) {
        this.onUndoEvent(event);
      }
      else if (isRedoEvent(event)) {
        this.onRedoEvent(event);
      }
    });

    input.addEventListener('input', () => {
      this.saveState();
      void this.loadHistory(this.inputElement.value);
    });
  }

  private onSubmitEvent() {
    this.onSubmitCallback?.(this.inputElement.value);
  }

  private readonly loadHistory = debounce(async (prefix: string) => {
    const history = await getHistory(window.location.hostname, prefix);
    this.historyList.querySelectorAll('option').forEach(option => option.remove());
    history.forEach((query) => {
      const option = createElement({
        element: 'option',
        attributes: { value: query },
        content: query,
      });
      this.historyList.appendChild(option);
    });
  }, 150);

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
