import { registerStyle } from '@core/ui/helpers';

export abstract class StyledComponentElement extends HTMLElement {
  // eslint-disable-next-line wc/no-closed-shadow-root
  protected readonly shadow = this.attachShadow({ mode: 'closed' });
  protected readonly _styles: HTMLStyleElement;

  // eslint-disable-next-line wc/no-constructor-params
  protected constructor(styles: string) {
    super();
    this._styles = registerStyle(this.shadow, styles);
  }
}
