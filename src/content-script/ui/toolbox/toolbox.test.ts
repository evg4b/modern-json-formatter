/* eslint-disable @typescript-eslint/unbound-method */
import '@testing/browser.mock';
import '@testing/query-input.mock';
import { beforeEach, describe, expect, test } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { type QueryInputElement } from '../query-input';
import { ToolboxElement } from './toolbox';

describe('Toolbox', () => {
  let toolbox: ToolboxElement;
  let shadowRoot: ShadowRoot;

  beforeEach(() => {
    toolbox = new ToolboxElement();
    shadowRoot = getShadowRoot(toolbox);
  });

  describe('button', () => {
    const cases = [
      { name: 'raw', selector: `button[ref="raw"]` },
      { name: 'formatted', selector: `button[ref="formatted"]` },
      { name: 'query', selector: `button[ref="query"]` },
    ];

    describe.each(cases)(`$name`, ({ name, selector }) => {
      let button: HTMLButtonElement | null;

      beforeEach(() => {
        button = shadowRoot.querySelector<HTMLButtonElement>(selector);
      });

      test('should exists', () => {
        expect(button).toBeTruthy();
      });

      test(`should match to snapshot`, () => {
        expect(button).toMatchSnapshot();
      });

      test(`should have handle click`, () => {
        const handler = jest.fn();
        toolbox.onTabChanged(handler);
        button?.click();

        expect(handler).toHaveBeenCalledWith(name);
      });
    });
  });

  describe('input', () => {
    let input: QueryInputElement | null;

    beforeEach(() => {
      input = shadowRoot.querySelector<QueryInputElement>('query-input');
    });

    test('should exists', () => {
      expect(input).toBeTruthy();
    });

    test('should be hided by default', () => {
      expect(input?.hide).toHaveBeenCalled();
    });

    describe('after query button click', () => {
      beforeEach(() => {
        shadowRoot.querySelector<HTMLButtonElement>('button[ref="query"]')?.click();
      });

      test('should be visible', () => {
        expect(input?.show).toHaveBeenCalledTimes(1);
      });

      test('should be focused', () => {
        expect(input?.focus).toHaveBeenCalledTimes(1);
      });

      test('should be hidden after raw button click', () => {
        shadowRoot.querySelector<HTMLButtonElement>('button[ref="raw"]')?.click();
        expect(input?.hide).toHaveBeenCalledTimes(2);
      });
    });

    test(`should set error to the input`, () => {
      const errorMessage = 'Test error message';

      toolbox.setErrorMessage(errorMessage);

      expect(input?.setErrorMessage).toHaveBeenCalledWith(errorMessage);
    });

    test(`should set submit handler on the input`, () => {
      const handler = () => {
        // stub for test
      };

      toolbox.onQueryChanged(handler);

      expect(input?.onSubmit).toHaveBeenCalledWith(handler);
    });
  });
});
