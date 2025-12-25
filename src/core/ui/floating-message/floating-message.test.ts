rstest.useFakeTimers({ toFake: ['setTimeout'] });

import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { FloatingMessageElement } from './floating-message';

describe('FloatingMessageElement', () => {
  let floatingMessage: FloatingMessageElement;

  renderLitElement('mjf-floating-message', element => {
    floatingMessage = element;
  });

  defaultLitAsserts(FloatingMessageElement, () => floatingMessage);

  describe('floating message', () => {
    let wrapper: Element | null;

    beforeEach(() => {
      wrapper = floatingMessage.shadowRoot?.querySelector('.wrapper') ?? null;
    });

    test('should exists', () => {
      expect(wrapper).not.toBeNull();
    });

    test('should be hidden', () => {
      expect(wrapper?.classList).not.toContain('visible');
    });

    test('should be informative by default', () => {
      const typeAttribute = floatingMessage.attributes.getNamedItem('type');

      expect(typeAttribute?.value).toEqual('info-message');
    });

    describe('after 100ms', () => {
      beforeEach(async () => {
        rstest.advanceTimersByTime(100);
        await floatingMessage.updateComplete;
      });

      test('should became visible', async () => {
        expect(wrapper?.classList).toContain('visible');
      });
    });

    test('should be hidden after 10s more', async () => {
      rstest.advanceTimersByTime(10_100);

      await floatingMessage.updateComplete;

      expect(wrapper?.classList).not.toContain('visible');
    });

    test('should be hidden after 250ms more', async () => {
      rstest.spyOn(floatingMessage, 'remove')
        .mockReturnValue(undefined);

      rstest.advanceTimersByTime(10_350);

      await floatingMessage.updateComplete;

      expect(floatingMessage.remove).toBeCalled();
    });

    test('should be able closed by click on close button', async () => {
      rstest.spyOn(floatingMessage, 'remove').mockReturnValue(undefined);

      rstest.advanceTimersByTime(100);

      const closeButton = floatingMessage.shadowRoot?.querySelector<HTMLDataElement>('.close');

      closeButton?.click();

      rstest.advanceTimersByTime(250);

      await floatingMessage.updateComplete;

      expect(wrapper?.classList).not.toContain('visible');
    });
  });
});
