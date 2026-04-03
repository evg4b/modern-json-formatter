import '@testing/browser.mock';
import { beforeEach, describe, expect, test } from '@rstest/core';
import { SidebarElement } from './sidebar';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import type { NavigationItem } from './models';

describe('mjf-sidebar', () => {
  let sidebarElement: SidebarElement;

  renderLitElement('mjf-sidebar', element => sidebarElement = element);

  defaultLitAsserts(SidebarElement, () => sidebarElement);

  test('should render logo and link section', () => {
    const root = sidebarElement.shadowRoot;
    expect(root?.querySelector('mjf-logo')).not.toBeNull();
    expect(root?.querySelector('.links')).not.toBeNull();
  });

  describe('with navigation items', () => {
    beforeEach(async () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');

      const items: NavigationItem[] = [
        {
          id: 'item1',
          title: 'Item 1',
          titleHtml: '<strong>Item 1</strong>',
          ref: div1,
        },
        {
          id: 'item2',
          title: 'Item 2',
          titleHtml: '<strong>Item 2</strong>',
          ref: div2,
          children: [
            {
              id: 'child1',
              title: 'Child 1',
              titleHtml: '<strong>Child 1</strong>',
              ref: div3,
            },
          ],
        },
      ];

      sidebarElement.items = items;
      sidebarElement.active = 'item1';
      await sidebarElement.updateComplete;
    });

    test('should render navigation items', () => {
      const links = sidebarElement.shadowRoot?.querySelectorAll('mjf-sidebar-link');
      expect(links?.length).toBeGreaterThanOrEqual(2);
    });

    test('should render child items when parent has children', () => {
      const section = sidebarElement.shadowRoot?.querySelector('.section');
      expect(section).not.toBeNull();
    });
  });
});
