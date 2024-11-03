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

  private createRawButton(): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.setAttribute('type', 'button');
    buttonElement.appendChild(document.createTextNode('Raw'));

    return buttonElement;
  }

  private createFormattedButton(): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.setAttribute('type', 'button');
    buttonElement.appendChild(document.createTextNode('Formatted'));

    return buttonElement;
  }

  private createQueryButton(): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.setAttribute('type', 'button');
    buttonElement.appendChild(document.createTextNode('Query'));

    return buttonElement;
  }
}
