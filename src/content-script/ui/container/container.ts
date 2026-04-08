import { LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './container.scss?inline';
import { createElement } from '@core/dom';
import '@core/ui/floating-message';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-container': ContainerElement;
  }
}

@customElement('mjf-container')
export class ContainerElement extends LitElement {
  public static override readonly shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
    mode: 'closed',
  };

  public static override readonly styles = [unsafeCSS(styles)];

  private readonly raw = document.createElement('div');
  private readonly formatted = document.createElement('div');
  private readonly query = document.createElement('div');
  private readonly loader = createElement({ element: 'div', class: 'loader' });

  @property({ type: String })
  public type: TabType = 'formatted';


  public override render() {
    return [this.loader, this.container];
  }

  public setRawContent(content: HTMLElement) {
    this.raw.replaceChildren(content);
  }

  public setFormattedContent(content: HTMLElement) {
    this.formatted.replaceChildren(content);
  }

  public setQueryContent(content: HTMLElement) {
    this.query.replaceChildren(content);
  }

  public setError(error: unknown) {
    console.error(error);
  }

  public startLoading() {
    this.setAttribute('loading', 'true');
  }

  public stopLoading() {
    this.removeAttribute('loading');
  }

  public message(header: string, content: string) {
    const created = createElement({
      element: 'mjf-floating-message',
      attributes: {
        type: 'info-message',
        header,
      },
      content: content,
    });

    this.renderRoot.appendChild(created);
  }

  private get container(): HTMLElement {
    switch (this.type) {
      case 'raw':
        return this.raw;
      case 'formatted':
        return this.formatted;
      case 'query':
        return this.query;
      default:
        throw new Error('Unknown type');
    }
  }
}
