import { CustomElement } from '@core/dom';
import { registerStyles } from '@core/ui/helpers';
import infoButtonStyles from './info-buton.module.scss';
import icon from './info-button-icon.svg';

@CustomElement('info-button')
export class InfoButtonElement extends HTMLElement {
  private readonly shadow = this.attachShadow({ mode: 'closed' });
  private readonly link = document.createElement('a');

  constructor(url: string) {
    super();
    this.shadow.appendChild(this.link);
    registerStyles(this.shadow, infoButtonStyles);
    this.link.innerHTML = icon;
    this.link.target = '_blank';
    this.link.href = url;
  }
}
