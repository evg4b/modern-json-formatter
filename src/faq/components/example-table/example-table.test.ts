import '@testing/browser.mock';
import '@testing/background.mock';
import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { jq } from '@core/background';
import { wrapMock } from '@testing/helpers';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { tArray, tBool, tErrorNode, tNull, tNumber, tObject, tProperty, tString, tTuple } from '@testing/json';
import type { TupleNode } from '@wasm/types';
import { ExampleTableElement, tokenNodeToString } from './example-table';

describe('ExampleTableElement', () => {
  let element: ExampleTableElement;
  const mockJq = wrapMock(jq);

  renderLitElement('mjf-example-table', el => {
    element = el as ExampleTableElement;
  });

  defaultLitAsserts(ExampleTableElement, () => element);

  beforeEach(() => {
    rstest.clearAllMocks();
  });

  test('is registered as mjf-example-table', () => {
    expect(customElements.get('mjf-example-table')).toBeDefined();
  });

  describe('default state', () => {
    test('pre-populates input fields and output from properties', async () => {
      element.query = '.foo';
      element.input = '{"foo": 1}';
      element.output = '1';
      await element.updateComplete;

      const inputs = element.shadowRoot!.querySelectorAll<HTMLInputElement>('input');
      expect(inputs[0].value).toBe('.foo');
      expect(inputs[1].value).toBe('{"foo": 1}');

      // Output div should contain the default output
      const outputDiv = element.shadowRoot!.querySelector<HTMLDivElement>('.code')!;
      expect(outputDiv.textContent?.trim()).toContain('1');
    });

    test('renders Exec button', async () => {
      await element.updateComplete;
      expect(element.shadowRoot!.querySelector('button')).not.toBeNull();
    });

    test('renders two input fields', async () => {
      await element.updateComplete;
      expect(element.shadowRoot!.querySelectorAll('input').length).toBe(2);
    });

  });

  describe('Exec with successful result', () => {
    beforeEach(async () => {
      element.query = '.';
      element.input = '"hello"';
      element.output = '"hello"';
      await element.updateComplete;

      mockJq.mockResolvedValue(tString('hello'));
      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;
      // wait for the async exec
      await Promise.resolve();
      await element.updateComplete;
    });

    test('calls jq with input and query', () => {
      expect(mockJq).toHaveBeenCalledWith('"hello"', '.');
    });

    test('shows result in output div', () => {
      const outputDiv = element.shadowRoot!.querySelector<HTMLDivElement>('.code')!;
      expect(outputDiv.textContent?.trim()).toContain('"hello"');
    });

    test('does not show error message', () => {
      expect(element.shadowRoot!.querySelector('mjf-example-error')).toBeNull();
    });
  });

  describe('Exec with error', () => {
    beforeEach(async () => {
      element.query = 'invalid';
      element.input = '{}';
      element.output = '';
      await element.updateComplete;

      mockJq.mockRejectedValue(tErrorNode('unexpected token', 'jq'));
      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;
    });

    test('calls jq with input and query', () => {
      expect(mockJq).toHaveBeenCalledWith('{}', 'invalid');
    });

    test('shows mjf-error-message with correct message', () => {
      const errorEl = element.shadowRoot?.querySelector('mjf-error-message');
      expect(errorEl).not.toBeNull();
      expect(errorEl?.textContent?.trim()).toBe('unexpected token');
    });

    test('shows error component instead of output lines', () => {
      const errorEl = element.shadowRoot?.querySelector('mjf-error-message');
      expect(errorEl).not.toBeNull();
    });
  });

  describe('Exec with non-ErrorNode rejection', () => {
    beforeEach(async () => {
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      mockJq.mockRejectedValue(new Error('Network error'));
      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;
    });

    test('shows mjf-error-message with actual error message', () => {
      const codeDiv = element.shadowRoot!.querySelector<HTMLDivElement>('.code')!;
      const errorEl = codeDiv.querySelector('mjf-error-message');
      expect(errorEl?.textContent?.trim()).toBe('Network error');
    });

    test('shows fallback message for unknown error type', async () => {
      // Reset state
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      // Reject with non-Error object
      mockJq.mockRejectedValue('string error');
      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;

      const codeDiv = element.shadowRoot!.querySelector<HTMLDivElement>('.code')!;
      const errorEl = codeDiv.querySelector('mjf-error-message');
      expect(errorEl?.textContent?.trim()).toBe('Unexpected error');
    });
  });

  describe('loading state', () => {
    test('Exec button is disabled while loading', async () => {
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolve!: (v: any) => void;
      mockJq.mockReturnValue(new Promise(res => {
        resolve = res;
      }));

      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;

      const button = element.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
      expect(button.disabled).toBe(true);

      // clean up
      resolve(tNull());
      await Promise.resolve();
    });

    test('shows "Running..." in output during loading', async () => {
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolve!: (v: any) => void;
      mockJq.mockReturnValue(new Promise(res => {
        resolve = res;
      }));

      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;

      const outputDiv = element.shadowRoot!.querySelector<HTMLDivElement>('.code')!;
      expect(outputDiv.textContent?.trim()).toBe('Running...');

      resolve(tNull());
      await Promise.resolve();
    });

    test('input fields are disabled while loading', async () => {
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolve!: (v: any) => void;
      mockJq.mockReturnValue(new Promise(res => {
        resolve = res;
      }));

      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;

      const inputs = element.shadowRoot!.querySelectorAll<HTMLInputElement>('input');
      expect(inputs[0].disabled).toBe(true);
      expect(inputs[1].disabled).toBe(true);

      // clean up
      resolve(tNull());
      await Promise.resolve();
    });
  });
});

describe('tokenNodeToString', () => {
  test('null node returns "null"', () => {
    expect(tokenNodeToString(tNull())).toBe('null');
  });

  test('boolean true returns "true"', () => {
    expect(tokenNodeToString(tBool(true))).toBe('true');
  });

  test('boolean false returns "false"', () => {
    expect(tokenNodeToString(tBool(false))).toBe('false');
  });

  test('number node returns its string value', () => {
    expect(tokenNodeToString(tNumber('42'))).toBe('42');
  });

  test('big number node preserves precision', () => {
    expect(tokenNodeToString(tNumber('12345678909876543212345'))).toBe('12345678909876543212345');
  });

  test('string node returns JSON-stringified value', () => {
    expect(tokenNodeToString(tString('hello'))).toBe('"hello"');
  });

  test('object node returns JSON object string', () => {
    expect(tokenNodeToString(tObject(tProperty('a', tNumber('1')), tProperty('b', tNull()))))
      .toBe('{"a": 1, "b": null}');
  });

  test('array node returns JSON array string', () => {
    expect(tokenNodeToString(tArray(tNull(), tBool(true), tNumber('3'))))
      .toBe('[null, true, 3]');
  });

  test('tuple joins items with newline', () => {
    expect(tokenNodeToString(tTuple(tString('a'), tString('b')) as TupleNode))
      .toBe('"a"\n"b"');
  });

  test('nested object in array', () => {
    const result = tokenNodeToString(tArray(tObject(tProperty('x', tNumber('1')))));
    expect(result).toBe('[{"x": 1}]');
  });
});
