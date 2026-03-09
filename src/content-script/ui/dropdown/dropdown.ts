import { customElement, property } from 'lit/decorators.js';
import { css, html, LitElement, type ReactiveController } from 'lit';
import { boxingFixCss } from '@core/styles/lit';
import { } from 'es-toolkit';
import '@core/ui/button';

export interface DropdownOption {
  label: string;
  onClick: () => void;
}

export class DropdownController implements ReactiveController {
  private readonly _id = crypto.randomUUID();
  private readonly dropdownElement: DropdownElement;

  constructor(private readonly options: DropdownOption[]) {
    this.dropdownElement = document.createElement('mjf-dropdown') as DropdownElement;
    this.dropdownElement.id = this._id;
  }

  public get element() {
    return this.dropdownElement;
  }

  public get id() {
    return this._id;
  }

  public readonly triggerOption = (event: MouseEvent) => {
    // @ts-expect-error Incorect type definiciotn
    this.element.togglePopover({
      source: event.currentTarget,
    });
  };

  hostConnected(): void {
    console.log('connected', this.options);
  }

  hostDisconnected(): void {
    console.log('disconnected', this.options);
  }
}

export const createDropdown = (options: DropdownOption[]) => {
  return new DropdownController(options);
};

@customElement('mjf-dropdown')
export class DropdownElement extends LitElement {
  public static formAssociated = true;

  constructor() {
    super();
  }

  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        transition: display 0.5s allow-discrete, overlay 0.5s allow-discrete;
      }
    `,
  ];

  @property({ type: Array })
  public options: DropdownOption[] = [];

  override connectedCallback() {
    super.connectedCallback?.();
    this.setAttribute('popover', 'auto');
  }

  public override render() {
    return html`
      <button>1i</button>
      <button>2i</button>
      <button>3i</button>
      <button>4i</button>
      <button>5i</button>
      <button>6i</button>
      <button>7i</button>
      <button>8i</button>
      <button>9i</button>
      <button>10i</button>
    `;
  }
}
