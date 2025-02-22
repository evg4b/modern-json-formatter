import { getHistory, pushHistory } from '@core/background';
import { getURL } from '@core/browser';
import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import { debounce } from 'lodash';
import { isNotNil } from '../../helpers';
import { InfoButtonElement } from '../info-button';
import { QueryHistory } from '../query-history/query-history';
import { HistoryManager } from './history-manager';
import { isRedoEvent, isSubmitEvent, isUndoEvent, isWrapEvent } from './query-input.helpers';
import queryInputStyles from './query-input.module.scss';

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

@CustomElement('query-input')
export class QueryInputElement extends StyledComponentElement {
  private readonly inputElement = this.createInput();
  private readonly errorMessageElement = createElement({
    element: 'span',
    class: ['error-message', 'hidden'],
  });
  private readonly queryHistoryElement = new QueryHistory();
  private readonly wrapperElement = createElement({
    element: 'div',
    class: 'input-wrapper',
    children: [
      this.inputElement,
      this.errorMessageElement,
      this.queryHistoryElement,
    ],
  });

  private readonly infoIcons = new InfoButtonElement(getURL('faq.html'));
  private readonly history = new HistoryManager<HistoryItem>();

  private onSubmitCallback: ((s: string) => unknown) | null = null;

  constructor() {
    super(queryInputStyles);
    this.shadow.append(this.infoIcons, this.wrapperElement);
    this.setupEventHandlers(this.inputElement);
    this.saveState();
    this.queryHistoryElement.onSelectedQuery(query => {
      this.inputElement.value = query;
      this.onSubmitEvent();
    });
  }

  public setErrorMessage(errorMessage: string | null): void {
    if (errorMessage) {
      this.errorMessageElement.textContent = errorMessage;
      this.errorMessageElement.classList.remove('hidden');
    } else {
      this.errorMessageElement.textContent = '';
      this.errorMessageElement.classList.add('hidden');
    }
  }

  public onSubmit(callback: (s: string) => void | Promise<void>): void {
    this.onSubmitCallback = callback;
  }

  public focus(): void {
    this.inputElement.focus();
  }

  public blur(): void {
    this.inputElement.blur();
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

  private setupEventHandlers(input: HTMLInputElement) {
    input.addEventListener('keydown', event => {
      this.setErrorMessage(null);
      if (isSubmitEvent(event)) {
        this.onSubmitEvent();
      } else if (isWrapEvent(event, brackets)) {
        this.onWrapEvent(event);
      } else if (isUndoEvent(event)) {
        this.onUndoEvent(event);
      } else if (isRedoEvent(event)) {
        this.onRedoEvent(event);
      }
    });

    input.addEventListener('input', () => {
      this.saveState();
      void this.loadHistory(this.inputElement.value);
      console.log('input', this.inputElement.value);
    });

    input.addEventListener('focus', () => {
      this.queryHistoryElement.open();
    });
  }

  private onSubmitEvent() {
    this.onSubmitCallback?.(this.inputElement.value);
    this.queryHistoryElement.close();
    pushHistory(window.location.hostname, this.inputElement.value);
  }

  private readonly loadHistory = debounce(async (prefix: string) => {
    const history = await getHistory(window.location.hostname, prefix);
    this.queryHistoryElement.setHistory(history);
    this.queryHistoryElement.open();
  }, 300);

  private onWrapEvent(event: KeyboardEvent) {
    const start = this.inputElement.selectionStart ?? 0;
    const end = this.inputElement.selectionEnd ?? 0;
    if (isNotNil(start) && isNotNil(end) && start !== end) {
      event.preventDefault();
      const selectedText = this.inputElement.value.substring(start, end);
      this.inputElement.setRangeText(`${ event.key }${ selectedText }${ brackets[event.key] }`);
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
