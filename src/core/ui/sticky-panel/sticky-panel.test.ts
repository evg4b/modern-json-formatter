import { beforeEach, describe, expect, test } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { StickyPanelElement } from './sticky-panel';

describe('mjf-sticky-panel', () => {
  let element: StickyPanelElement;

  renderLitElement('mjf-sticky-panel', el => {
    element = el;
  });

  defaultLitAsserts(StickyPanelElement, () => element);

  test('should have default position of rightTop', () => {
    expect(element.position).toBe('rightTop');
  });

  test('should reflect position attribute', async () => {
    element.position = 'leftBottom';
    await element.updateComplete;
    expect(element.getAttribute('position')).toBe('leftBottom');
  });

  describe('render', () => {
    test('should render a slot element', () => {
      const slot = element.shadowRoot?.querySelector('slot');
      expect(slot).not.toBeNull();
    });

    test('should accept slotted content', () => {
      const child = document.createElement('div');
      child.textContent = 'test content';
      element.appendChild(child);
      expect(element.children.length).toBeGreaterThan(0);
    });
  });

  describe('position property', () => {
    beforeEach(async () => {
      await element.updateComplete;
    });

    test.each(['rightTop', 'rightBottom', 'leftTop', 'leftBottom'] as const)(
      'should accept position "%s"',
      async pos => {
        element.position = pos;
        await element.updateComplete;
        expect(element.position).toBe(pos);
      },
    );
  });
});
