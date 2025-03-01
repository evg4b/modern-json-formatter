import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import infoButtonStyles from './info-buton.styles';
import icon from './info-button-icon.svg';

@CustomElement('info-button')
export class InfoButtonElement extends StyledComponentElement {
  private readonly link = createElement({
    element: 'a',
    html: icon,
    attributes: {
      target: '_blank',
    },
  });

  constructor(url: string) {
    super(infoButtonStyles);
    this.shadow.appendChild(this.link);
    this.link.href = url;
  }
}
