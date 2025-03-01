import { createElement, CustomElement, StyledComponentElement } from '@core/dom';
import { assetTabType } from '../../helpers';
import { QueryInputElement } from '../query-input';
import toolboxStyles from './toolbox.styles.txt';

@CustomElement('extension-toolbox')
export class ToolboxElement extends StyledComponentElement {
  private readonly input = new QueryInputElement();
  private readonly rawButton = this.createButton('Raw', 'raw');
  private readonly formattedButton = this.createButton('Formatted', 'formatted', true);
  private readonly queryButton = this.createButton('Query', 'query');

  private readonly buttonList: [TabType, HTMLButtonElement][] = [
    ['raw', this.rawButton],
    ['formatted', this.formattedButton],
    ['query', this.queryButton],
  ];

  private tabChangedCallback: ((s: TabType) => void) | null = null;

  constructor() {
    super(toolboxStyles);
    const container = createElement({
      element: 'div',
      class: 'button-container',
      children: [this.queryButton, this.formattedButton, this.rawButton],
    });
    this.shadow.append(this.input, container);
    this.shadow.addEventListener('click', e => {
      if (e.target instanceof HTMLButtonElement) {
        e.preventDefault();
        const ref = e.target.getAttribute('ref');
        assetTabType(ref);
        this.activateButton(ref);
      }
    });
    this.input.hide();
  }

  public onQueryChanged(callback: (s: string) => void | Promise<void>): void {
    this.input.onSubmit(callback);
  }

  public onTabChanged(callback: (s: TabType) => void): void {
    this.tabChangedCallback = callback;
  }

  public setErrorMessage(error: string): void {
    this.input.setErrorMessage(error);
  }

  private activateButton(tab: TabType): void {
    this.buttonList.forEach(([key, value]) =>
      key === tab ? value.classList.add('active') : value.classList.remove('active'),
    );
    this.tabChangedCallback?.(tab);
    if (tab === 'query') {
      this.input.show();
      this.input.focus();
    } else {
      this.input.hide();
    }
  }

  private createButton(content: string, ref: TabType, active = false): HTMLButtonElement {
    return createElement({
      element: 'button',
      content,
      class: active ? 'active' : undefined,
      attributes: { type: 'button', ref },
    });
  }
}
