import { describe, expect, test } from '@rstest/core';
import { SideBarLinkElement } from './side-bar-link';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';

describe('mjf-sidebar-link', () => {
  let sidebarLink: SideBarLinkElement;

  renderLitElement('mjf-sidebar-link', element => {
    sidebarLink = element;
  });

  defaultLitAsserts(SideBarLinkElement, () => sidebarLink);

  test('should render anchor element', () => {
    const anchor = sidebarLink.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('#');
  });
});
