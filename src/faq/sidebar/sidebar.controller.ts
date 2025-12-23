import type { ReactiveController } from 'lit';
import type { ReactiveControllerHost } from '@lit/reactive-element/reactive-controller.js';
import type { NavigationItem } from './models';
import { assert } from 'typed-assert';
import { head } from 'es-toolkit';
import { createContext } from '@lit/context';

export const sidebarControllerContext = createContext<SidebarController>(Symbol('sidebar-controller'));

export class SidebarController implements ReactiveController {
  private readonly itemsMap = new Map<string, NavigationItem>();

  public active: string | null = null;

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this);
  }

  public hostConnected() {
    // interface implementation
  }

  public contentRef = (a: Element | undefined) => {
    a?.addEventListener('scroll', this.scrollEndHandler);
    setTimeout(this.scrollEndHandler, 10);
  };

  public get items() {
    return Array.from(this.itemsMap.values());
  }

  public registerSection(section: HTMLSelectElement) {
    const header = section.querySelector('h2');
    if (!header) {
      return;
    }

    assert(header.id.length > 0, 'Header id should be present');

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

  private scrollEndHandler = () => {
    const visibleItems = this.items
      .flatMap(item => [item, ...item.children ?? []])
      .flatMap(item => {
        const rect = item.ref.getBoundingClientRect();
        if (rect.top < globalThis.innerHeight) {
          return { id: item.id, offset: Math.abs(rect.top), ref: item.ref };
        }

        return [];
      })
      .toSorted((a, b) => a.offset - b.offset);

    const activeItem = head(visibleItems);
    if (activeItem) {
      this.active = activeItem.id;
      this.host.requestUpdate();
    }
  };
}
