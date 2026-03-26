import { describe, expect, rstest, test } from '@rstest/core';
import { SideBarLinkElement } from './side-bar-link';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import type { NavigationItem } from './models';

rstest.mock('@core/helpers', () => ({
  isInViewport: rstest.fn().mockReturnValue(false),
}));

const makeItem = (): NavigationItem => ({
  id: 'test',
  title: 'Test',
  titleHtml: 'Test',
  ref: document.createElement('h2'),
  children: [],
});

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

  test('onClick prevents default and calls scrollIntoView on item ref', async () => {
    const scrollIntoView = rstest.fn();
    sidebarLink.item = { ...makeItem(), ref: { scrollIntoView } as unknown as HTMLElement };
    await sidebarLink.updateComplete;

    const anchor = sidebarLink.shadowRoot?.querySelector('a') as HTMLAnchorElement;
    anchor.dispatchEvent(new PointerEvent('click', { bubbles: true }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
      inline: 'center',
    });
  });

  test('updated scrolls into view when active changes and element is not in viewport', async () => {
    const scrollIntoView = rstest.fn();
    rstest.spyOn(sidebarLink, 'scrollIntoView').mockImplementation(scrollIntoView);

    sidebarLink.active = true;
    await sidebarLink.updateComplete;

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  });
});
