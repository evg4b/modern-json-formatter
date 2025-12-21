import { describe } from '@rstest/core';
import { SideBarLinkElement } from './side-bar-link.ts';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';

describe('mjf-sidebar-link', () => {
  let sidebarLink: SideBarLinkElement;

  renderLitElement('mjf-sidebar-link', element => {
    sidebarLink = element;
  });

  defaultLitAsserts(SideBarLinkElement, () => sidebarLink);
});
