import '@testing/background.mock';
import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { jq } from '@core/background';
import { wrapMock } from '@testing/helpers';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { tArray, tBool, tErrorNode, tNull, tNumber, tObject, tProperty, tString, tTuple } from '@testing/json';
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

  describe('static mode (default)', () => {
    test('renders Query, Input, Output rows from properties', async () => {
      element.query = '.foo';
      element.input = '{"foo": 1}';
      element.output = '1';
      await element.updateComplete;

      const tds = element.shadowRoot!.querySelectorAll('td');
      expect(tds[0].textContent?.trim()).toBe('.foo');
      expect(tds[1].textContent?.trim()).toBe('{"foo": 1}');
      expect(tds[2].textContent?.trim()).toBe('1');
    });

    test('does not render Exec button in static mode', async () => {
      await element.updateComplete;
      expect(element.shadowRoot!.querySelector('button')).toBeNull();
    });

    test('does not render input fields in static mode', async () => {
      await element.updateComplete;
      expect(element.shadowRoot!.querySelectorAll('input').length).toBe(0);
    });

    test('renders a hint to click', async () => {
      await element.updateComplete;
      expect(element.shadowRoot!.querySelector('.hint')).not.toBeNull();
    });
  });

  describe('edit mode (after click)', () => {
    beforeEach(async () => {
      element.query = '.';
      element.input = '"hello"';
      element.output = '"hello"';
      await element.updateComplete;

      element.shadowRoot!.querySelector<HTMLElement>('.wrapper')!.click();
      await element.updateComplete;
    });

    test('renders two input fields', () => {
      expect(element.shadowRoot!.querySelectorAll('input').length).toBe(2);
    });

    test('pre-populates query input with property value', () => {
      const inputs = element.shadowRoot!.querySelectorAll<HTMLInputElement>('input');
      expect(inputs[0].value).toBe('.');
    });

    test('pre-populates input field with property value', () => {
      const inputs = element.shadowRoot!.querySelectorAll<HTMLInputElement>('input');
      expect(inputs[1].value).toBe('"hello"');
    });

    test('renders Exec button', () => {
      expect(element.shadowRoot!.querySelector('button')).not.toBeNull();
    });

    test('output row shows initial expected value before Exec', () => {
      const tds = element.shadowRoot!.querySelectorAll('td');
      expect(tds[2].textContent?.trim()).toBe('"hello"');
    });

    test('does not show error message', () => {
      expect(element.shadowRoot!.querySelector('.error-message')).toBeNull();
    });

    test('does not render hint', () => {
      expect(element.shadowRoot!.querySelector('.hint')).toBeNull();
    });
  });

  describe('Exec with successful result', () => {
    beforeEach(async () => {
      element.query = '.';
      element.input = '"hello"';
      element.output = '"hello"';
      await element.updateComplete;

      element.shadowRoot!.querySelector<HTMLElement>('.wrapper')!.click();
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

    test('shows result in output row', () => {
      const tds = element.shadowRoot!.querySelectorAll('td');
      expect(tds[2].textContent?.trim()).toBe('"hello"');
    });

    test('does not show error message', () => {
      expect(element.shadowRoot!.querySelector('.error-message')).toBeNull();
    });
  });

  describe('Exec with error', () => {
    beforeEach(async () => {
      element.query = 'invalid';
      element.input = '{}';
      element.output = '';
      await element.updateComplete;

      element.shadowRoot!.querySelector<HTMLElement>('.wrapper')!.click();
      await element.updateComplete;

      mockJq.mockRejectedValue(tErrorNode('unexpected token', 'jq'));
      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;
      await Promise.resolve();
      await element.updateComplete;
    });

    test('shows error message', () => {
      const errorEl = element.shadowRoot!.querySelector('.error-message');
      expect(errorEl?.textContent?.trim()).toBe('unexpected token');
    });

    test('result remains null (shows original output)', () => {
      const tds = element.shadowRoot!.querySelectorAll('td');
      expect(tds[2].textContent?.trim()).toBe('');
    });
  });

  describe('Exec with non-ErrorNode rejection', () => {
    beforeEach(async () => {
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      element.shadowRoot!.querySelector<HTMLElement>('.wrapper')!.click();
      await element.updateComplete;

      mockJq.mockRejectedValue(new Error('Network error'));
      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;
      await Promise.resolve();
      await element.updateComplete;
    });

    test('shows generic error message', () => {
      const errorEl = element.shadowRoot!.querySelector('.error-message');
      expect(errorEl?.textContent?.trim()).toBe('Unexpected error');
    });
  });

  describe('loading state', () => {
    test('Exec button is disabled while loading', async () => {
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      element.shadowRoot!.querySelector<HTMLElement>('.wrapper')!.click();
      await element.updateComplete;

      let resolve!: (v: unknown) => void;
      mockJq.mockReturnValue(new Promise(res => { resolve = res; }));

      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;

      const button = element.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
      expect(button.disabled).toBe(true);

      // clean up
      resolve(tNull());
      await Promise.resolve();
    });

    test('shows Running... in output during loading', async () => {
      element.query = '.';
      element.input = 'null';
      element.output = 'null';
      await element.updateComplete;

      element.shadowRoot!.querySelector<HTMLElement>('.wrapper')!.click();
      await element.updateComplete;

      let resolve!: (v: unknown) => void;
      mockJq.mockReturnValue(new Promise(res => { resolve = res; }));

      element.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click'));
      await element.updateComplete;

      const tds = element.shadowRoot!.querySelectorAll('td');
      expect(tds[2].textContent?.trim()).toBe('Running...');

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
    expect(tokenNodeToString(tObject(tProperty('a', tNumber('1')), tProperty('b', tNull())))).toBe('{"a":1,"b":null}');
  });

  test('array node returns JSON array string', () => {
    expect(tokenNodeToString(tArray(tNull(), tBool(true), tNumber('3')))).toBe('[null,true,3]');
  });

  test('tuple joins items with newline', () => {
    expect(tokenNodeToString(tTuple(tString('a'), tString('b')))).toBe('"a"\n"b"');
  });

  test('nested object in array', () => {
    const result = tokenNodeToString(tArray(tObject(tProperty('x', tNumber('1')))));
    expect(result).toBe('[{"x":1}]');
  });
});
