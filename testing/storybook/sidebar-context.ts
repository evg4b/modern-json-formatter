import { ContextProvider } from '@lit/context';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { SidebarController, sidebarControllerContext } from '../../src/faq/sidebar/sidebar.controller';

/**
 * `mjf-section` consumes the sidebar controller that `mjf-faq-page` provides.
 * Stories rendering sections on their own wrap them in this host instead.
 */
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
