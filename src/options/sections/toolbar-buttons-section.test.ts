import { beforeEach, describe, expect, rstest, test, type Mock } from '@rstest/core';
import { ButtonsChangeEvent, ToolbarButtonsSectionElement } from './toolbar-buttons-section';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import type { ToolbarButtonsSettings } from '@core/settings';

describe('mjf-toolbar-buttons-section', () => {
  let element: ToolbarButtonsSectionElement;

  renderLitElement('mjf-toolbar-buttons-section', el => {
    element = el;
  });

  defaultLitAsserts(ToolbarButtonsSectionElement, () => element);

  test('renders section heading', () => {
    const h3 = element.shadowRoot?.querySelector('h3');
    expect(h3?.textContent?.trim()).toBe('Toolbar Buttons');
  });

  test('renders section hint', () => {
    const hint = element.shadowRoot?.querySelector('.section-hint');
    expect(hint).not.toBeNull();
    expect(hint?.textContent?.trim().length).toBeGreaterThan(0);
  });

  describe('checkboxes', () => {
    let checkboxes: HTMLInputElement[];

    beforeEach(() => {
      checkboxes = Array.from(
        element.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [],
      );
    });

    test('renders four checkboxes', () => {
      expect(checkboxes).toHaveLength(4);
    });

    test.each(['query', 'formatted', 'raw', 'download'])(
      '"%s" checkbox exists',
      key => {
        expect(checkboxes.find(cb => cb.dataset.key === key)).toBeDefined();
      },
    );

    test.each(['query', 'formatted', 'raw', 'download'])(
      '"%s" checkbox is checked when buttons property is all-true (default)',
      key => {
        const cb = checkboxes.find(c => c.dataset.key === key);
        expect(cb?.checked).toBe(true);
      },
    );

    describe('when buttons property has some disabled', () => {
      beforeEach(async () => {
        element.buttons = { query: false, formatted: true, raw: false, download: true };
        await element.updateComplete;
        checkboxes = Array.from(
          element.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [],
        );
      });

      test.each([
        { key: 'query', expected: false },
        { key: 'formatted', expected: true },
        { key: 'raw', expected: false },
        { key: 'download', expected: true },
      ])('"%key" checkbox reflects the property value', ({ key, expected }) => {
        expect(checkboxes.find(cb => cb.dataset.key === key)?.checked).toBe(expected);
      });
    });

    describe.each(['query', 'formatted', 'raw', 'download'] as const)(
      'toggling the "%s" checkbox',
      key => {
        let handler: Mock<(e: ButtonsChangeEvent) => void>;

        beforeEach(async () => {
          handler = rstest.fn();
          element.addEventListener('buttons-change', handler as EventListener);
          const cb = checkboxes.find(c => c.dataset.key === key)!;
          cb.checked = false;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
          await element.updateComplete;
        });

        test('dispatches a buttons-change event', () => {
          expect(handler).toHaveBeenCalledTimes(1);
        });

        test('event detail has the toggled key set to false', () => {
          const detail = (handler.mock.calls[0][0] as ButtonsChangeEvent).detail;
          expect(detail[key]).toBe(false);
        });

        test('event detail preserves the other keys as true', () => {
          const detail = (handler.mock.calls[0][0] as ButtonsChangeEvent).detail;
          const others = (['query', 'formatted', 'raw', 'download'] as const).filter(k => k !== key);
          for (const other of others) {
            expect(detail[other]).toBe(true);
          }
        });

        test('updates the buttons property', () => {
          expect(element.buttons[key]).toBe(false);
        });
      },
    );
  });

  describe('each option has a hint text', () => {
    const options: { key: keyof ToolbarButtonsSettings; label: string }[] = [
      { key: 'query', label: 'Query' },
      { key: 'formatted', label: 'Formatted' },
      { key: 'raw', label: 'Raw' },
      { key: 'download', label: 'Download' },
    ];

    test.each(options)('"%label" option has a non-empty hint', ({ key }) => {
      const checkbox = element.shadowRoot?.querySelector<HTMLInputElement>(`input[data-key="${key}"]`);
      const optionText = checkbox?.closest('label')?.querySelector('.option-hint');
      expect(optionText?.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});
