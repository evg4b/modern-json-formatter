import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { SidebarElement } from './sidebar';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';

describe('mjf-sidebar', () => {
  let sidebarElement: SidebarElement;

  renderLitElement('mjf-sidebar', element => sidebarElement = element);

  defaultLitAsserts(SidebarElement, () => sidebarElement);

  test('should render logo and link section', () => {
    const root = sidebarElement.shadowRoot;
    expect(root?.querySelector('mjf-logo')).not.toBeNull();
    expect(root?.querySelector('.links')).not.toBeNull();
  });
});
