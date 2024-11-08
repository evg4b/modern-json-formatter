import '@testing/browser.mock';
import { beforeEach, describe, expect, test } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { QueryInputElement } from './query-input';

describe('QueryInputElement', () => {
  let input: QueryInputElement;
  let shadowRoot: ShadowRoot;

  beforeEach(() => {
    input = new QueryInputElement();
    shadowRoot = getShadowRoot(input);
  });

  test('should create input element', () => {
    const innerInput = shadowRoot.querySelector('input');
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
});
