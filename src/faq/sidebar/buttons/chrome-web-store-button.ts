import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import icon from './chrome-web-store-button-icon.svg?raw';
import { ButtonMixin } from "./button.mixin.ts";
import { BUTTONS } from "@core/constants";

declare global {
  interface HTMLElementTagNameMap {
    'mjf-chrome-web-store-button': ChromeWebStoreButtonElement;
  }
}

@customElement('mjf-chrome-web-store-button')
export class ChromeWebStoreButtonElement extends ButtonMixin(LitElement) {
  public override render() {
    return this.renderLink(icon, BUTTONS.CHROME_WEB_STORE);
  }
}