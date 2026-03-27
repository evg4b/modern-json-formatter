import { beforeEach, describe, expect, rstest, test, type Mock } from '@rstest/core';
import { DownloadModeSectionElement, ModeChangeEvent } from './download-mode-section';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import type { DownloadMode } from '@core/settings';

describe('mjf-download-mode-section', () => {
  let element: DownloadModeSectionElement;

  renderLitElement('mjf-download-mode-section', el => {
    element = el;
  });

  defaultLitAsserts(DownloadModeSectionElement, () => element);

  test('renders section heading', () => {
    const h3 = element.shadowRoot?.querySelector('h3');
    expect(h3?.textContent?.trim()).toBe('Download Button Mode');
  });

  test('renders section hint', () => {
    const hint = element.shadowRoot?.querySelector('.section-hint');
    expect(hint).not.toBeNull();
    expect(hint?.textContent?.trim().length).toBeGreaterThan(0);
  });

  describe('radio buttons', () => {
    let radios: HTMLInputElement[];

    beforeEach(() => {
      radios = Array.from(
        element.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [],
      );
    });

    test('renders four radio buttons', () => {
      expect(radios).toHaveLength(4);
    });

    test.each(['dropdown', 'raw', 'formatted', 'minified'])(
      '"%s" radio exists',
      value => {
        expect(radios.find(r => r.value === value)).toBeDefined();
      },
    );

    test('"dropdown" is selected by default', () => {
      expect(radios.find(r => r.value === 'dropdown')?.checked).toBe(true);
    });

    test.each(['raw', 'formatted', 'minified'])(
      '"%s" is not selected by default',
      value => {
        expect(radios.find(r => r.value === value)?.checked).toBe(false);
      },
    );

    describe.each(['dropdown', 'raw', 'formatted', 'minified'] as const)(
      'when mode property is "%s"',
      mode => {
        beforeEach(async () => {
          element.mode = mode;
          await element.updateComplete;
          radios = Array.from(
            element.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [],
          );
        });

        test(`"${mode}" radio is checked`, () => {
          expect(radios.find(r => r.value === mode)?.checked).toBe(true);
        });

        test('no other radio is checked', () => {
          const others = radios.filter(r => r.value !== mode);
          for (const r of others) {
            expect(r.checked).toBe(false);
          }
        });
      },
    );

    describe.each(['dropdown', 'raw', 'formatted', 'minified'] as const)(
      'selecting the "%s" radio',
      mode => {
        let handler: Mock<(e: ModeChangeEvent) => void>;

        beforeEach(async () => {
          handler = rstest.fn();
          element.addEventListener('mode-change', handler as unknown as EventListener);
          const radio = radios.find(r => r.value === mode)!;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          await element.updateComplete;
        });

        test('dispatches a mode-change event', () => {
          expect(handler).toHaveBeenCalledTimes(1);
        });

        test(`event detail is "${mode}"`, () => {
          const detail = (handler.mock.calls[0][0] as ModeChangeEvent).detail;
          expect(detail).toBe(mode);
        });

        test('updates the mode property', () => {
          expect(element.mode).toBe(mode);
        });
      },
    );
  });

  describe('disabled state', () => {
    test('is not disabled by default', () => {
      expect(element.disabled).toBe(false);
      expect(element.hasAttribute('disabled')).toBe(false);
    });

    describe('when disabled property is set to true', () => {
      beforeEach(async () => {
        element.disabled = true;
        await element.updateComplete;
      });

      test('disabled property is true', () => {
        expect(element.disabled).toBe(true);
      });

      test('reflects disabled as a DOM attribute', () => {
        expect(element.hasAttribute('disabled')).toBe(true);
      });
    });

    describe('when disabled property is set back to false', () => {
      beforeEach(async () => {
        element.disabled = true;
        await element.updateComplete;
        element.disabled = false;
        await element.updateComplete;
      });

      test('removes the disabled DOM attribute', () => {
        expect(element.hasAttribute('disabled')).toBe(false);
      });
    });
  });

  describe('each option has a hint text', () => {
    const modes: DownloadMode[] = ['dropdown', 'raw', 'formatted', 'minified'];

    test.each(modes)('"%s" option has a non-empty hint', mode => {
      const radio = element.shadowRoot?.querySelector<HTMLInputElement>(`input[value="${mode}"]`);
      const hint = radio?.closest('label')?.querySelector('.option-hint');
      expect(hint?.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});
