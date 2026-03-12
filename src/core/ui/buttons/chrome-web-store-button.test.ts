import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { ChromeWebStoreButtonElement } from '@core/ui';
import { BUTTONS } from '@core/constants';
import './chrome-web-store-button';

describe('mjf-chrome-web-store-button', () => {
  let button: ChromeWebStoreButtonElement;

  renderLitElement('mjf-chrome-web-store-button', element => {
    button = element;
  });

  defaultLitAsserts(ChromeWebStoreButtonElement, () => button);

  test('should render link to Chrome Web Store', () => {
    const anchor = button.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe(BUTTONS.CHROME_WEB_STORE.URL);
  });
});
