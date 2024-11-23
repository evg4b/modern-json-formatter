import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import floatingMessageStyles from './floating-message.module.scss';

@CustomElement('floating-message')
export class FloatingMessageElement extends StyledComponentElement {
  private readonly close = createElement({ element: 'div', class: 'close' });

  constructor(header: string, message: string) {
    super(floatingMessageStyles);

    this.shadow.append(
      createElement({
        element: 'div',
        class: 'header-container',
        children: [
          createElement({ element: 'div', class: 'header', content: header }),
          this.close,
        ],
      }),
      createElement({ element: 'div', class: 'body', content: message }),
    );

    setTimeout(() => this.classList.add('opened'), 10);

    const id = setTimeout(() => this.closeMessage(), 10_000);
    this.close.addEventListener('click', () => {
      clearTimeout(id);
      this.closeMessage();
    });
  }

  private closeMessage() {
    this.classList.remove('opened');
    setTimeout(() => this.remove(), 250);
  }
}
