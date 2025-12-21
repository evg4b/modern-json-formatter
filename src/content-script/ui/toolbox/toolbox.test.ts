import '@testing/browser.mock';
import { beforeEach, describe, expect, test } from '@rstest/core';
import { ToolboxElement } from './toolbox';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { ButtonElement } from '@core/ui/button';

describe('mjf-toolbox', () => {
  let toolbox: ToolboxElement;

  renderLitElement('mjf-toolbox', element => toolbox = element);

  defaultLitAsserts(ToolboxElement, () => toolbox);

  describe('buttons', () => {
    let buttons: ButtonElement[];

    beforeEach(() => {
      buttons = Array.from(toolbox.shadowRoot?.querySelectorAll('mjf-button') ?? []);
    });

    test('should have 3 buttons', () => {
      expect(buttons).toHaveLength(3);
    });

    test.each(['Raw', 'Formatted', 'Query'])('should have a %s button', buttonName => {
      expect(buttons.find(b => b.innerText.trim() === buttonName)).toBeDefined();
    });

    describe('by default', () => {
      test('Formatted should be active', () => {
        const button = buttons.find(b => b.innerText.trim() === 'Formatted');
        expect(button?.active).toBe(true);
      });

      test.each(['Raw', 'Query'])('%s should be inactive', () => {
        const button = buttons.find(b => b.innerText.trim() === 'Raw');
        expect(button?.active).toBe(false);
      });
    });
  });
});
