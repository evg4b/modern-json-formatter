import '@testing/browser.mock';
import { describe } from '@rstest/core';
import { SidebarElement } from './sidebar';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';

describe('mjf-sidebar', () => {
  let sidebarElement: SidebarElement;

  renderLitElement('mjf-sidebar', element => sidebarElement = element);

  defaultLitAsserts(SidebarElement, () => sidebarElement);
});
