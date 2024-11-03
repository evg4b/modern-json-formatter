import { getURL } from '@core/browser';
import { CustomElement } from '@core/dom';
import { registerStyles } from '@core/ui/helpers';
import { InfoButtonElement } from '../info-button';
import queryInputStyles from './query-input.module.scss';

@CustomElement('query-input')
export class QueryInputElement extends HTMLElement {
  private readonly shadow = this.attachShadow({ mode: 'closed' });

  private readonly input = this.createInput();
  private readonly errorMessage = this.createErrorMessage();
  private readonly infoIcons = new InfoButtonElement(getURL('faq.html'));

  private onSubmitCallback: ((s: string) => void) | null = null;

  constructor() {
    super();
    registerStyles(this.shadow, queryInputStyles);
    const wrapper = document.createElement('div');
    wrapper.classList.add('input-wrapper');
    wrapper.append(this.input, this.errorMessage);
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

  public onSubmit(callback: (s: string) => void): void {
    this.onSubmitCallback = callback;
  }

  private createInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Input jq query...';
    input.addEventListener('keydown', async event => {
      if (event.key === 'Enter') {
        this.setErrorMessage(null);
        this.onSubmitCallback?.(input.value);
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
