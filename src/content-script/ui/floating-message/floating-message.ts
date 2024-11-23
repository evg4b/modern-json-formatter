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

    // const id = setTimeout(() => this.remove(), 15_000);
    this.close.addEventListener('click', () => {
      // clearTimeout(id);
      this.remove();
    });
  }
}
