import { registerStyles } from '@core/ui/helpers';
import styles from './button.module.scss';

export abstract class BaseButtonElement extends HTMLElement {
  private readonly link = document.createElement('a');

  protected constructor(icon: string) {
    super();
    const shadowRoot = this.attachShadow({ mode: 'closed' });
    registerStyles(shadowRoot, styles);

    this.link.innerHTML = icon;
    this.link.target = '_blank';

    shadowRoot.appendChild(this.link);
  }

  public static get observedAttributes() {
    return ['href', 'title'];
  }

  public attributeChangedCallback(name: string, _: unknown, newValue: string) {
    this.link.setAttribute(name, newValue);
  }
}
