import '@testing/browser.mock';
import { beforeEach, describe, expect, type Mock, rstest, test } from '@rstest/core';
import { TabChangedEvent, ToolboxElement } from './toolbox';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { ButtonElement } from '@core/ui/button';
import { without } from 'es-toolkit';

describe('mjf-toolbox', () => {
  let toolbox: ToolboxElement;

  renderLitElement('mjf-toolbox', element => toolbox = element);

  defaultLitAsserts(ToolboxElement, () => toolbox);

  const mapping = { Raw: 'raw', Formatted: 'formatted', Query: 'query' } as const;

  const buttonNames = Object.keys(mapping) as (keyof typeof mapping)[];
  const buttonValues = Object.values(mapping) as TabType[];

  describe('buttons', () => {
    let buttons: ButtonElement[];

    beforeEach(() => {
      buttons = Array.from(toolbox.shadowRoot?.querySelectorAll('mjf-button') ?? []);
    });

    test('should have 3 buttons', () => {
      expect(buttons).toHaveLength(3);
    });

    test.each(buttonNames)('should have a %s button', buttonName => {
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

    describe.each(buttonNames)('after clicking %s button', buttonName => {
      let handler: Mock<(event: TabChangedEvent) => void>;

      beforeEach(async () => {
        handler = rstest.fn();

        toolbox.addEventListener('tab-changed', handler);

        buttons.find(b => b.innerText.trim() === buttonName)
          ?.click();
        await toolbox.updateComplete;
      });

      test.each(without(buttonNames, buttonName))('%s button should be inactive', buttonName => {
        expect(buttons.find(b => b.innerText.trim() === buttonName)?.active)
          .toBe(false);
      });

      test(`${buttonName} button should be active`, () => {
        expect(buttons.find(b => b.innerText.trim() === buttonName)?.active)
          .toBe(true);
      });

      test('should emit tab-changed event', () => {
        expect(handler).toHaveBeenCalledTimes(1);

        const event = handler.mock.calls[0][0];

        expect(event).toBeInstanceOf(TabChangedEvent);
        expect(event.detail).toBe(mapping[buttonName]);
        expect(event.type).toBe('tab-changed');
      });
    });
  });

  describe.each(without(buttonValues, 'query'))('should reflect tab="%s" property', tabValue => {
    beforeEach(async () => {
      toolbox.tab = tabValue;
      await toolbox.updateComplete;
    });

    test('should not render input', () => {
      expect(toolbox.shadowRoot?.querySelector('mjf-query-input'))
        .toBeNull();
    });
  });

  describe('should reflect tab="query" property', () => {
    beforeEach(async () => {
      toolbox.tab = 'query';
      await toolbox.updateComplete;
    });

    test('should render input', () => {
      expect(toolbox.shadowRoot?.querySelector('mjf-query-input'))
        .toBeDefined();
    });
  });
});
