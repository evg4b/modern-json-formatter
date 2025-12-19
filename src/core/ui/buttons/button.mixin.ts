import { css, type CSSResult, html, LitElement, type TemplateResult } from 'lit';
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface INFO {
  URL: string;
  TITLE: string;
}

export declare class ButtonMixinInterface {
  public static readonly styles: CSSResult;

  public renderLink(icon: string, info: INFO): void;
}

export const ButtonMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class ButtonClass extends superClass implements ButtonMixinInterface {
    public static readonly styles = css`
      a {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease-in-out;
          
        &:hover {
            transform: scale(1.2);
        }
      }
    `

    public renderLink(icon: string, info: INFO): TemplateResult<1> {
      return html`
        <a href="${info.URL}" target="_blank" title=${info.TITLE}>
            ${unsafeSVG(icon)}
        </a>
      `;
    }
  }

  return ButtonClass as unknown as Constructor<ButtonMixinInterface> & T;
}