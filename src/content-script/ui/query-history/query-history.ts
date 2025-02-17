import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import { defer } from 'lodash-es';
import { throws } from '../../helpers';
import styles from './query-history.module.scss';

@CustomElement('query-history')
export class QueryHistory extends StyledComponentElement {
  private readonly container = createElement({
    element: 'div',
    class: 'container',
  });

  private onQueryClickHandler: ((query: string) => void) | null = null;

  constructor() {
    super(styles);
    this.shadow.appendChild(this.container);
    this.container.addEventListener('click', this.onQueryClick.bind(this));
    this.container.addEventListener('transitionend', () => {
      if (!this.container.classList.contains('opened')) {
        this.container.classList.add('hidden');
      }
    });
  }

  public addQuery(query: string): void {
    this.container.appendChild(createElement({
      element: 'div',
      class: 'query',
      content: query,
      attributes: {
        value: query,
      },
    }));
  }

  public setHistory(history: string[]): void {
    this.container.childNodes.forEach((node) => node.remove());
    history.forEach(this.addQuery.bind(this));
    if (history.length) {
      this.close();
    }
  }

  public onSelectedQuery(callback: (query: string) => void): void {
    this.onQueryClickHandler = callback;
  }

  public open(): void {
    if (!this.container.children.length) {
      return;
    }
    this.container.classList.add('opened');
  }

  public close(): void {
    this.container.classList.remove('opened', 'hidden');
  }

  private onQueryClick({ target }: MouseEvent): void {
    if (target instanceof HTMLDivElement) {
      const query = target.getAttribute('value') ?? throws('Query value is not set');
      defer(() => {
        this.onQueryClickHandler?.(query);
        this.close();
      })
    }
  }
}
