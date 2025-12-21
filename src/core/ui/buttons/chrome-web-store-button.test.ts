import '@testing/browser.mock';
import { describe } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';
import { ChromeWebStoreButtonElement } from '@core/ui';
import './chrome-web-store-button';

describe('mjf-chrome-web-store-button', () => {
  let button: ChromeWebStoreButtonElement;

  renderLitElement('mjf-chrome-web-store-button', element => {
    button = element;
  });

  defaultLitAsserts(ChromeWebStoreButtonElement, () => button);
});
