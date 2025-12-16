import type { ReactiveController } from "lit";
import type { ReactiveControllerHost } from "@lit/reactive-element/reactive-controller.js";
import type { NavigationItem } from "../sidebar_2/models.ts";
import { assert } from "typed-assert";

export class SidebarController implements ReactiveController {
  private itemsMap = new Map<string, NavigationItem>();

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this);
  }

  public hostConnected() {
    console.log('connected', this.host);
  }

  public get items() {
    return Array.from(this.itemsMap.values());
  }

  public registerSection(section: HTMLSelectElement) {
    const header = section.querySelector('h2');
    if (!header) {
      return;
    }

    assert(header.id.length > 0, 'Header id should be present')

    this.itemsMap.set(header.id, {
      id: header.id,
      title: header.textContent,
      titleHtml: header.innerHTML,
      ref: header,
      children: Array.from(section.querySelectorAll('h3'))
        .map<NavigationItem>(subHeader => ({
          id: subHeader.id,
          title: subHeader.textContent,
          titleHtml: subHeader.innerHTML,
          ref: subHeader,
        })),
    });

    this.host.requestUpdate();
  }
}