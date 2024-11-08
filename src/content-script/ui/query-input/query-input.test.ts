/* eslint-disable @typescript-eslint/unbound-method */
import '@testing/browser.mock';
import { beforeEach, describe, expect, test } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { throws } from '../../helpres';
import { QueryInputElement } from './query-input';

describe('QueryInputElement', () => {
  let input: QueryInputElement;
  let innerInput: HTMLInputElement | null;
  let shadowRoot: ShadowRoot;

  beforeEach(() => {
    input = new QueryInputElement();
    shadowRoot = getShadowRoot(input);
    innerInput = shadowRoot.querySelector('input');
  });

  test('should create input element', () => {
    expect(innerInput).not.toBeNull();
  });

  describe('errors', () => {
    let errorMessage: HTMLElement | null;

    beforeEach(() => {
      errorMessage = shadowRoot.querySelector('.error-message');
    });

    test('should exists', () => {
      expect(errorMessage).not.toBeNull();
    });

    test('should have no error message by defaults', () => {
      input.setErrorMessage(null);

      expect(errorMessage?.classList.contains('hidden')).toBe(true);
      expect(errorMessage?.textContent).toEqual('');
    });

    test('should show error message', () => {
      input.setErrorMessage('Error message');

      expect(errorMessage?.classList.contains('hidden')).toBe(false);
      expect(errorMessage?.textContent).toEqual('Error message');
    });

    test('should hide error message', () => {
      input.setErrorMessage('Error message');
      input.setErrorMessage(null);

      expect(errorMessage?.classList.contains('hidden')).toBe(true);
      expect(errorMessage?.textContent).toEqual('');
    });
  });

  describe('show/hide', () => {
    test('should visible by default', () => {
      expect(input.style.display).not.toEqual('none');
    });

    test('should hide', () => {
      input.hide();

      expect(input.style.display).toEqual('none');
    });

    test('should show', () => {
      input.hide();
      input.show();

      expect(input.style.display).not.toEqual('none');
    });
  });

  describe('focus/blur', () => {
    test('should focus', () => {
      Reflect.set(innerInput ?? throws('No input'), 'focus', jest.fn());

      input.focus();

      expect(innerInput?.focus).toBeCalled();
    });

    test('should blur', () => {
      Reflect.set(innerInput ?? throws('No input'), 'blur', jest.fn());

      input.blur();

      expect(innerInput?.blur).toBeCalled();
    });
  });

  describe('typing', () => {
    test('should call onSubmitCallback on Enter', () => {
      const onSubmitCallback = jest.fn();
      input.onSubmit(onSubmitCallback);
      innerInput?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(onSubmitCallback).toBeCalled();
    });

    test('should not call onSubmitCallback on other key', () => {
      const onSubmitCallback = jest.fn();
      input.onSubmit(onSubmitCallback);
      innerInput?.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

      expect(onSubmitCallback).not.toBeCalled();
    });

    test('should clear error message on typing', () => {
      input.setErrorMessage('Error message');
      innerInput?.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

      expect(shadowRoot.querySelector('.error-message')?.classList.contains('hidden')).toBe(true);
    });
  });
});
