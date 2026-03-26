import '@testing/browser.mock';
import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { ExampleErrorElement } from './example-error';

describe('ExampleErrorElement', () => {
  let el: ExampleErrorElement;

  beforeEach(async () => {
    el = document.createElement('mjf-example-error') as ExampleErrorElement;
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  test('is registered as mjf-example-error', () => {
    expect(customElements.get('mjf-example-error')).toBeDefined();
  });

  test('is an instance of ExampleErrorElement', () => {
    expect(el).toBeInstanceOf(ExampleErrorElement);
  });

  test('has shadowRoot', () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  test('has empty message by default', () => {
    expect(el.message).toBe('');
  });

  test('renders the error image', () => {
    const img = el.shadowRoot!.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('alt')).toBe('Error');
  });

  test('renders the message text', async () => {
    el.message = 'unexpected token at line 1';
    await el.updateComplete;

    const span = el.shadowRoot!.querySelector('.message span');
    expect(span?.textContent).toBe('unexpected token at line 1');
  });

  test('updates rendered message when property changes', async () => {
    el.message = 'first error';
    await el.updateComplete;
    el.message = 'second error';
    await el.updateComplete;

    const span = el.shadowRoot!.querySelector('.message span');
    expect(span?.textContent).toBe('second error');
  });

  test('has .error container', () => {
    expect(el.shadowRoot!.querySelector('.error')).not.toBeNull();
  });

  test('has .message container inside .error', () => {
    expect(el.shadowRoot!.querySelector('.error .message')).not.toBeNull();
  });
});
