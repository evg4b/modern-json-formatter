import { describe, expect, test } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { InfoButtonElement } from './info-buton';

describe('mjf-info-button', () => {
  let infoButtonElement: InfoButtonElement;

  renderLitElement('mjf-info-button', element => infoButtonElement = element);

  defaultLitAsserts(InfoButtonElement, () => infoButtonElement);

  test('should bind url to anchor href', async () => {
    const url = 'https://example.com';
    infoButtonElement.url = url;
    await infoButtonElement.updateComplete;

    const anchor = infoButtonElement.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe(url);
  });
});
