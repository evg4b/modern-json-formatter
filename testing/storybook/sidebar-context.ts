import { ContextProvider } from '@lit/context';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { SidebarController, sidebarControllerContext } from '../../src/faq/sidebar';

export const createSidebarContextHost = (...children: Node[]): HTMLElement => {
  const host = document.createElement('div');
  const controllerHost: ReactiveControllerHost = {
    addController: (_: ReactiveController) => undefined,
    removeController: (_: ReactiveController) => undefined,
    requestUpdate: () => undefined,
    updateComplete: Promise.resolve(true),
  };

  new ContextProvider(host, {
    context: sidebarControllerContext,
    initialValue: new SidebarController(controllerHost),
  });

  host.append(...children);
  return host;
};
