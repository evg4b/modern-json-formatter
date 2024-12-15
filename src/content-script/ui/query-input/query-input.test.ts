/* eslint-disable @typescript-eslint/unbound-method */
import '@testing/browser.mock';
import { beforeEach, describe, expect, test } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { throws } from '../../helpres';
import { brackets, QueryInputElement } from './query-input';
import { isRedoEvent, isSubmitEvent, isUndoEvent, isWrapEvent } from './query-input.helpres';

describe('QueryInputElement', () => {
  let input: QueryInputElement;
  let innerInput: HTMLInputElement;
  let shadowRoot: ShadowRoot;

  const keyPress = (key: string, options?: KeyboardEventInit) => {
    const fakeEvent = new KeyboardEvent('keydown', { key, ...(options ?? {}) });
    innerInput.dispatchEvent(fakeEvent);
    if (
      !isRedoEvent(fakeEvent)
      && !isUndoEvent(fakeEvent)
      && !isSubmitEvent(fakeEvent)
      && !isWrapEvent(fakeEvent, brackets)
    ) {
      innerInput.value += key;
      innerInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const undo = () => {
    keyPress('z', { ctrlKey: true });
  };

  const redo = () => {
    keyPress('z', { ctrlKey: true, shiftKey: true });
  };

  const times = (n: number, fn: () => void) => {
    Array.from({ length: n })
      .forEach(fn);
  };

  beforeEach(() => {
    input = new QueryInputElement();
    shadowRoot = getShadowRoot(input);
    innerInput = shadowRoot.querySelector('input') ?? throws('No input');
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
      Reflect.set(innerInput, 'focus', jest.fn());

      input.focus();

      expect(innerInput.focus).toBeCalled();
    });

    test('should blur', () => {
      Reflect.set(innerInput, 'blur', jest.fn());

      input.blur();

      expect(innerInput.blur).toBeCalled();
    });
  });

  describe('typing', () => {
    test('should call onSubmitCallback on Enter', () => {
      const onSubmitCallback = jest.fn();
      input.onSubmit(onSubmitCallback);
      keyPress('Enter');

      expect(onSubmitCallback).toBeCalled();
    });

    test('should not call onSubmitCallback on other key', () => {
      const onSubmitCallback = jest.fn();
      input.onSubmit(onSubmitCallback);
      keyPress('a');

      expect(onSubmitCallback).not.toBeCalled();
    });

    test('should clear error message on typing', () => {
      input.setErrorMessage('Error message');
      keyPress('a');

      expect(shadowRoot.querySelector('.error-message')?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('for selection', () => {
    const query = '.[] | key, value';
    const expectedSelection = 'key, value';

    beforeEach(() => {
      innerInput.value = '.[] | key, value';
      innerInput.focus();
    });

    const items = [
      { key: '[', expected: '.[] | [key, value]' },
      { key: '(', expected: '.[] | (key, value)' },
      { key: '{', expected: '.[] | {key, value}' },
      { key: '\'', expected: '.[] | \'key, value\'' },
      { key: '"', expected: '.[] | "key, value"' },
      { key: '`', expected: '.[] | `key, value`' },
    ];

    describe('when text is selected', () => {
      const start = query.indexOf(expectedSelection);
      const end = start + expectedSelection.length;

      beforeEach(() => {
        innerInput.setSelectionRange(start, end);
      });

      describe.each(items)('when $key is pressed', ({ key, expected }) => {
        beforeEach(() => {
          innerInput.dispatchEvent(new KeyboardEvent('keydown', { key }));
        });

        test('should save selection', () => {
          const selectedText = innerInput.value.substring(innerInput.selectionStart ?? 0, innerInput.selectionEnd ?? 0);
          expect(selectedText).toEqual(expectedSelection);
        });

        test(`should wrap selected text with ${ key }`, () => {
          expect(innerInput.value).toEqual(expected);
        });
      });
    });

    describe('for selected text', () => {
      beforeEach(() => {
        innerInput.setSelectionRange(query.length, query.length);
      });

      describe.each(items)('when $key is pressed', ({ key }) => {
        beforeEach(() => {
          innerInput.dispatchEvent(new KeyboardEvent('keydown', { key }));
        });

        test(`should not change text`, () => {
          expect(innerInput.value).toEqual(query);
        });
      });
    });
  });

  describe('history', () => {
    const select = (start: number, end: number) => {
      innerInput.setSelectionRange(start, end);
    };

    beforeEach(() => {
      keyPress('1');
      select(0, 1);
      keyPress('2');
      select(1, 2);
      keyPress('3');
      select(2, 3);
      keyPress('4');
      select(2, 4);
      keyPress('5');
    });

    describe('undo', () => {
      test('should undo value', () => {
        undo();

        expect(innerInput.value).toEqual('1234');
      });

      test('should undo value multiple times', () => {
        times(3, () => undo());

        expect(innerInput.value).toEqual('12');
      });

      test('should not undo if no more states', () => {
        times(10, () => undo());

        expect(innerInput.value).toEqual('');
      });
    });

    describe('redo', () => {
      beforeEach(() => {
        times(3, () => undo());
      });

      test('should redo value', () => {
        redo();
        expect(innerInput.value).toEqual('123');
      });

      test('should redo multiple times', () => {
        times(2, () => redo());

        expect(innerInput.value).toEqual('1234');
      });

      test('should not redo if no more states', () => {
        times(10, () => redo());

        expect(innerInput.value).toEqual('12345');
      });

      test('should not redo after changing', () => {
        times(3, () => keyPress('#'));
        redo();

        expect(innerInput.value).toEqual('12###');
      });
    });
  });
});
