import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import floatingMessageStyles from './floating-message.styles.txt';

@CustomElement('floating-message')
export class FloatingMessageElement extends StyledComponentElement {
  private readonly close = createElement({ element: 'div', class: 'close' });

  constructor(header: string, message: string) {
    super(floatingMessageStyles);
    this.classList.add('hidden');

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

    setTimeout(() => this.classList.remove('hidden'), 10);

    const id = setTimeout(() => this.closeMessage(), 10_000);
    this.close.addEventListener('click', () => {
      clearTimeout(id);
      this.closeMessage();
    });
  }

  private closeMessage() {
    this.classList.add('hidden');
    setTimeout(() => {
      this.remove();
    }, 250);
  }
}
