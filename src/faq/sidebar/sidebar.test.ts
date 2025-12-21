import '@testing/browser.mock';
import { describe } from '@rstest/core';
import { SidebarElement } from './sidebar.ts';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';

describe('mjf-sidebar', () => {
  let sidebarElement: SidebarElement;

  renderLitElement('mjf-sidebar', element => sidebarElement = element);

  defaultLitAsserts(SidebarElement, () => sidebarElement);
});
