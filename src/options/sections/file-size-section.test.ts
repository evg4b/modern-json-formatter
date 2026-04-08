import { beforeEach, describe, expect, rstest, test, type Mock } from '@rstest/core';
import { FileSizeChangeEvent, FileSizeSectionElement } from './file-size-section';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { DEFAULT_MAX_FILE_SIZE_MB, MAX_FILE_SIZE_MB, MIN_FILE_SIZE_MB } from '@core/settings';

describe('mjf-file-size-section', () => {
  let element: FileSizeSectionElement;

  renderLitElement('mjf-file-size-section', el => {
    element = el;
  });

  defaultLitAsserts(FileSizeSectionElement, () => element);

  test('renders a range input', () => {
    const input = element.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
    expect(input).not.toBeNull();
  });

  test('range input has correct min attribute', () => {
    const input = element.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
    expect(Number(input?.min)).toBe(MIN_FILE_SIZE_MB);
  });

  test('range input has correct max attribute', () => {
    const input = element.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
    expect(Number(input?.max)).toBe(MAX_FILE_SIZE_MB);
  });

  test('range input has step of 1', () => {
    const input = element.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
    expect(Number(input?.step)).toBe(1);
  });

  test('default maxFileSize equals DEFAULT_MAX_FILE_SIZE_MB', () => {
    expect(element.maxFileSize).toBe(DEFAULT_MAX_FILE_SIZE_MB);
  });

  test('value label shows current value in MB', () => {
    const label = element.shadowRoot?.querySelector('.value-label');
    expect(label?.textContent?.trim()).toBe(`${element.maxFileSize} MB`);
  });

  test('renders min bound label', () => {
    const bounds = element.shadowRoot?.querySelectorAll('.bounds span');
    expect(bounds?.[0]?.textContent?.trim()).toBe(`${MIN_FILE_SIZE_MB} MB`);
  });

  test('renders max bound label', () => {
    const bounds = element.shadowRoot?.querySelectorAll('.bounds span');
    expect(bounds?.[1]?.textContent?.trim()).toBe(`${MAX_FILE_SIZE_MB} MB`);
  });

  describe('when maxFileSize property changes', () => {
    beforeEach(async () => {
      element.maxFileSize = 10;
      await element.updateComplete;
    });

    test('updates the value label', () => {
      const label = element.shadowRoot?.querySelector('.value-label');
      expect(label?.textContent?.trim()).toBe('10 MB');
    });

    test('reflects the value on the range input', () => {
      const input = element.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
      expect(Number(input?.value)).toBe(10);
    });
  });

  describe('while dragging (input event)', () => {
    let handler: Mock<(e: FileSizeChangeEvent) => void>;

    beforeEach(async () => {
      handler = rstest.fn();
      element.addEventListener('file-size-change', handler as unknown as EventListener);
      const found = element.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
      if (!found) throw new Error('range input not found');
      found.value = '7';
      found.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;
    });

    test('updates the maxFileSize property for live label', () => {
      expect(element.maxFileSize).toBe(7);
    });

    test('does not dispatch a file-size-change event', () => {
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('when the range input is committed (change event)', () => {
    let handler: Mock<(e: FileSizeChangeEvent) => void>;

    beforeEach(async () => {
      handler = rstest.fn();
      element.addEventListener('file-size-change', handler as unknown as EventListener);
      const found = element.shadowRoot?.querySelector<HTMLInputElement>('input[type="range"]');
      if (!found) throw new Error('range input not found');
      found.value = '7';
      found.dispatchEvent(new Event('change', { bubbles: true }));
      await element.updateComplete;
    });

    test('dispatches a file-size-change event', () => {
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('event detail contains the new value as a number', () => {
      const detail = (handler.mock.calls[0][0] as FileSizeChangeEvent).detail;
      expect(detail).toBe(7);
    });

    test('updates the maxFileSize property', () => {
      expect(element.maxFileSize).toBe(7);
    });
  });
});
