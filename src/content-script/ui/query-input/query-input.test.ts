import '@testing/browser.mock';
import '@testing/background.mock';
import { beforeEach, describe, expect, type Mock, rstest, test } from '@rstest/core';
import { brackets, QueryInputElement } from './query-input';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { isNil } from 'es-toolkit';
import { isRedoEvent, isSubmitEvent, isUndoEvent, isWrapEvent } from './query-input.helpers.ts';
import { getHistory } from '@core/background';

rstest.useFakeTimers();

describe('mjf-query-input', () => {
  let queryInputElement: QueryInputElement;
  let innerInput: HTMLInputElement;

  const keyPress = (key: string, options?: KeyboardEventInit) => {
    const fakeEvent = new KeyboardEvent('keydown', { key, ...options ?? {} });
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

  renderLitElement('mjf-query-input', element => {
    queryInputElement = element;
    const inputElement = queryInputElement.shadowRoot?.querySelector<HTMLInputElement>('input');
    if (isNil(inputElement)) {
      throw new Error('should not render input');
    }

    innerInput = inputElement;
  });

  defaultLitAsserts(QueryInputElement, () => queryInputElement);

  test('input should be rendered', () => {
    expect(innerInput).toBeDefined();
  });

  describe('focus/blur', () => {
    test('should focus', () => {
      Reflect.set(innerInput, 'focus', rstest.fn());

      innerInput.focus();

      expect(innerInput.focus).toHaveBeenCalled();
    });

    test('should blur', () => {
      Reflect.set(innerInput, 'blur', rstest.fn());

      innerInput.blur();

      expect(innerInput.blur).toHaveBeenCalled();
    });
  });

  describe('typing', () => {
    test('should emit event jq-query by Enter', () => {
      const onSubmitCallback = rstest.fn();

      queryInputElement.addEventListener('jq-query', onSubmitCallback);

      keyPress('Enter');

      expect(onSubmitCallback).toHaveBeenCalled();
    });

    test('should not call onSubmitCallback on other key', () => {
      const onSubmitCallback = rstest.fn();

      queryInputElement.addEventListener('jq-query', onSubmitCallback);
      keyPress('a');

      expect(onSubmitCallback).not.toHaveBeenCalled();
    });

    test('should clear error message on typing', async () => {
      queryInputElement.error = 'Error message';
      await queryInputElement.updateComplete;

      keyPress('a');

      await queryInputElement.updateComplete;

      expect(queryInputElement.shadowRoot?.querySelector('mjf-error-message'))
        .toBeNull();
    });
  });

  describe('errors', () => {
    const errorMessageQuery = () => queryInputElement.shadowRoot
      ?.querySelector('mjf-error-message');

    test('should have no error message by defaults', () => {
      expect(errorMessageQuery()).toBeNull();
    });

    test('should show error message', async () => {
      queryInputElement.error = 'Error message';

      await queryInputElement.updateComplete;

      const errorMessage = errorMessageQuery();

      expect(errorMessage).not.toBeNull();
      expect(errorMessage?.textContent.trim()).toEqual('Error message');
    });

    test('should hide error message', async () => {
      queryInputElement.error = 'Error message';
      await queryInputElement.updateComplete;

      queryInputElement.error = null;
      await queryInputElement.updateComplete;

      const errorMessage = errorMessageQuery();

      expect(errorMessage).toBeNull();
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

        test(`should wrap selected text with ${key}`, () => {
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

        test('should not change text', () => {
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

  describe('query history', () => {
    const historyDatalistQuery = () => queryInputElement.shadowRoot?.querySelector('datalist') ?? null;

    beforeEach(() => {
      (getHistory as Mock<typeof getHistory>)
        .mockResolvedValue(['.[]', '.[0]', '. | map(.id)']);
      rstest.runAllTimers();
    });

    test('should have datalist', () => {
      expect(historyDatalistQuery()).not.toBeNull();
    });

    test('should load history', () => {
      expect(getHistory).toHaveBeenCalledWith(window.location.hostname, '');
    });

    test('should load history on focus', () => {
      const options = Array.from(historyDatalistQuery()?.querySelectorAll('option') ?? [])
        .map(option => ({
          value: option.value,
          textContent: option.textContent,
        }));

      expect(options).toEqual([
        { value: '.[]', textContent: '.[]' },
        { value: '.[0]', textContent: '.[0]' },
        { value: '. | map(.id)', textContent: '. | map(.id)' },
      ]);
    });
  });
});
