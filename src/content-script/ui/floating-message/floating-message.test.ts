rstest.useFakeTimers();

import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { FloatingMessageElement } from './floating-message';

describe('FloatingMessageElement', () => {
  let floatingMessage: FloatingMessageElement;

  beforeEach(() => {
    floatingMessage = new FloatingMessageElement('Test Header', 'Test Message');
    document.body.appendChild(floatingMessage);
  });

  afterEach(() => {
    document.body.removeChild(floatingMessage);
  });

  test('should create a hidden floating message element', () => {
    expect(floatingMessage.classList).toContain('hidden');
  });

  test('de', () => {
    expect(document.body.firstChild).toBe(floatingMessage);
  });

  describe('header', () => {
    beforeEach(() => {
      rstest.advanceTimersByTime(1000);
    });

    test('should display the message after a timeout', () => {
      expect(floatingMessage.classList).not.toContain('hidden');
    });

    test('should display the header', () => {
      expect(floatingMessage.shadowRoot).toMatchSnapshot();
    });
  });
});
