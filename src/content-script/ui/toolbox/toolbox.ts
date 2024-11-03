import { CustomElement } from '@core/dom';
import { registerStyles } from '@core/ui/helpers';
import { QueryInputElement } from '../query-input';
import toolboxStyles from './toolbox.module.scss';

@CustomElement('toolbox-2')
export class ToolboxElement extends HTMLElement {
  private readonly shadow = this.attachShadow({ mode: 'closed' });

  private readonly input = new QueryInputElement();
  private readonly rawButton = this.createRawButton();
  private readonly formattedButton = this.createFormattedButton();
  private readonly queryButton = this.createQueryButton();

  private readonly buttonList: [TabType, HTMLButtonElement][] = [
    ['raw', this.rawButton],
    ['formatted', this.formattedButton],
    ['query', this.queryButton],
  ];

  private tabChangedCallback: ((s: TabType) => void) | null = null;

  constructor() {
    super();
    registerStyles(this.shadow, toolboxStyles);
    this.shadow.appendChild(this.input);
    this.shadow.appendChild(this.queryButton);
    this.shadow.appendChild(this.formattedButton);
    this.shadow.appendChild(this.rawButton);
  }

  public onQueryChanged(callback: (s: string) => void): void {
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
      key === tab
        ? value.classList.add('active')
        : value.classList.remove('active'),
    );
    this.tabChangedCallback?.(tab);
  }

  private createRawButton(): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.setAttribute('type', 'button');
    buttonElement.appendChild(document.createTextNode('Raw'));
    buttonElement.addEventListener('click', () => this.activateButton('raw'));

    return buttonElement;
  }

  private createFormattedButton(): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.setAttribute('type', 'button');
    buttonElement.appendChild(document.createTextNode('Formatted'));
    buttonElement.addEventListener('click', () => this.activateButton('formatted'));

    return buttonElement;
  }

  private createQueryButton(): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.setAttribute('type', 'button');
    buttonElement.appendChild(document.createTextNode('Query'));
    buttonElement.addEventListener('click', () => this.activateButton('query'));

    return buttonElement;
  }
}
