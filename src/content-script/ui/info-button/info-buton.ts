import { CustomElement, StyledComponentElement } from '@core/dom';
import infoButtonStyles from './info-buton.module.scss';
import icon from './info-button-icon.svg';

@CustomElement('info-button')
export class InfoButtonElement extends StyledComponentElement {
  private readonly link = document.createElement('a');

  constructor(url: string) {
    super(infoButtonStyles);
    this.shadow.appendChild(this.link);
    this.link.innerHTML = icon;
    this.link.target = '_blank';
    this.link.href = url;
  }
}
