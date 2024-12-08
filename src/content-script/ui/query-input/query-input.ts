import { getURL } from '@core/browser';
import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import { isNotNil } from '../../helpres';
import { InfoButtonElement } from '../info-button';
import queryInputStyles from './query-input.module.scss';

const endKeys: Record<string, string> = {
  '[': ']',
  '(': ')',
  '{': '}',
  '\'': '\'',
  '"': '"',
  '`': '`',
};

@CustomElement('query-input')
export class QueryInputElement extends StyledComponentElement {
  private readonly input = this.createInput();
  private readonly errorMessage = this.createErrorMessage();
  private readonly infoIcons = new InfoButtonElement(getURL('faq.html'));

  private onSubmitCallback: ((s: string) => unknown) | null = null;

  constructor() {
    super(queryInputStyles);
    const wrapper = createElement({
      element: 'div',
      class: 'input-wrapper',
      children: [this.input, this.errorMessage],
    });
    this.shadow.append(this.infoIcons, wrapper);
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
    input.addEventListener('keydown', event => {
      this.setErrorMessage(null);
      if (event.key === 'Enter') {
        this.onSubmitCallback?.(input.value);
      }
      if (endKeys[event.key]) {
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        if (isNotNil(start) && isNotNil(end) && start !== end) {
          event.preventDefault();
          const selectedText = input.value.substring(start, end);
          input.setRangeText(`${ event.key }${ selectedText }${ endKeys[event.key] }`);
          input.setSelectionRange(start + 1, end + 1);
        }
      }
    });

    return input;
  }

  private createErrorMessage(): HTMLSpanElement {
    const errorMessage = document.createElement('span');
    errorMessage.classList.add('error-message', 'hidden');
    return errorMessage;
  }
}
