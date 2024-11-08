import { registerStyles } from '@core/ui/helpers';

export abstract class StyledComponentElement extends HTMLElement {
  protected readonly shadow = this.attachShadow({ mode: 'closed' });
  protected readonly _styles: HTMLStyleElement;

  protected constructor(styles: string) {
    super();
    this._styles = registerStyles(this.shadow, styles);
  }
}
