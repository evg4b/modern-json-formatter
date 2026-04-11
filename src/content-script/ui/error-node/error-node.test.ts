import '@testing/browser.mock';
import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { ErrorNodeElement } from './error-node';

describe('ErrorNodeElement', () => {
  let el: ErrorNodeElement;

  beforeEach(async () => {
    el = document.createElement('mjf-error-node') as ErrorNodeElement;
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  test('should be an instance of ErrorNodeElement', () => {
    expect(el).toBeInstanceOf(ErrorNodeElement);
  });

  test('should have empty header and lines by default', () => {
    expect(el.header).toBe('');
    expect(el.lines).toEqual([]);
  });

  test('should render the error image', () => {
    const img = el.shadowRoot?.querySelector('svg');
    expect(img).not.toBeNull();
  });

  test('should render header when set', async () => {
    el.header = 'Invalid JSON file.';
    await el.updateComplete;

    const spans = el.shadowRoot?.querySelectorAll('.message span');
    expect(spans?.[0]?.textContent).toBe('Invalid JSON file.');
  });

  test('should render additional lines', async () => {
    el.header = 'Error';
    el.lines = ['Line one', 'Line two'];
    await el.updateComplete;

    const spans = el.shadowRoot?.querySelectorAll('.message span');
    expect(spans?.length).toBe(3);
    expect(spans?.[1]?.textContent).toBe('Line one');
    expect(spans?.[2]?.textContent).toBe('Line two');
  });
});
