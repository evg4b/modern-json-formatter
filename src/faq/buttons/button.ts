import { createElement, StyledComponentElement } from '@core/dom';
import styles from './button.styles';

export abstract class BaseButtonElement extends StyledComponentElement {
  private readonly link = createElement({
    element: 'a',
    attributes: {
      target: '_blank',
    },
  });

  protected constructor(icon: string) {
    super(styles);
    this.link.innerHTML = icon;
    this.shadow.appendChild(this.link);
  }

  public static get observedAttributes() {
    return ['href', 'title'];
  }

  public attributeChangedCallback(name: string, _: unknown, newValue: string) {
    this.link.setAttribute(name, newValue);
  }
}
