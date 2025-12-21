import { describe } from '@rstest/core';
import { SideBarLinkElement } from './side-bar-link';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';

describe('mjf-sidebar-link', () => {
  let sidebarLink: SideBarLinkElement;

  renderLitElement('mjf-sidebar-link', element => {
    sidebarLink = element;
  });

  defaultLitAsserts(SideBarLinkElement, () => sidebarLink);
});
