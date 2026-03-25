import '@testing/browser.mock';
import { beforeEach, describe, expect, type Mock, rstest, test } from '@rstest/core';
import { DownloadEvent, TabChangedEvent, ToolboxElement } from './toolbox';
import { type DropdownOption } from '@core/ui';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { without } from 'es-toolkit';

describe('mjf-toolbox', () => {
  let toolbox: ToolboxElement;

  renderLitElement('mjf-toolbox', element => toolbox = element);

  defaultLitAsserts(ToolboxElement, () => toolbox);

  const mapping = { Raw: 'raw', Formatted: 'formatted', Query: 'query' } as const;

  const buttonNames = Object.keys(mapping) as (keyof typeof mapping)[];
  const buttonValues = Object.values(mapping) as TabType[];

  describe('buttons', () => {
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
      buttons = Array.from(toolbox.shadowRoot?.querySelectorAll('button') ?? []);
    });

    test('should have 4 buttons', () => {
      expect(buttons).toHaveLength(4);
    });

    test.each(buttonNames)('should have a %s button', buttonName => {
      expect(buttons.find(b => b.innerText.trim() === buttonName))
        .toBeDefined();
    });

    test('should have a download button', () => {
      expect(buttons.find(b => b.classList.contains('square')))
        .toBeDefined();
    });

    describe('by default', () => {
      test('Formatted should be active', () => {
        const button = buttons.find(b => b.innerText.trim() === 'Formatted');
        expect(button?.classList.contains('active'))
          .toBe(true);
      });

      test.each(['Raw', 'Query'])('%s should be inactive', () => {
        const button = buttons.find(b => b.innerText.trim() === 'Raw');
        expect(button?.classList.contains('active'))
          .toBe(false);
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
        expect(buttons.find(b => b.innerText.trim() === buttonName)?.classList.contains('active'))
          .toBe(false);
      });

      test(`${buttonName} button should be active`, () => {
        expect(buttons.find(b => b.innerText.trim() === buttonName)?.classList.contains('active'))
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

  describe('download dropdown', () => {
    describe.each([
      { label: 'Raw', type: 'raw' },
      { label: 'Formatted', type: 'formatted' },
      { label: 'Minified', type: 'minified' },
    ] as const)('clicking "$label" option', ({ label, type }) => {
      let handler: Mock<(event: DownloadEvent) => void>;

      beforeEach(() => {
        handler = rstest.fn();
        toolbox.addEventListener('download', handler);
        const options = (toolbox as unknown as { dropdown: DropdownOption[] }).dropdown;
        options.find(o => o.label === label)?.onClick();
      });

      test(`should emit download event with type="${type}"`, () => {
        expect(handler).toHaveBeenCalledTimes(1);
        const event = handler.mock.calls[0][0];
        expect(event).toBeInstanceOf(DownloadEvent);
        expect(event.detail).toBe(type);
        expect(event.type).toBe('download');
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
        .not.toBeNull();
    });
  });
});
