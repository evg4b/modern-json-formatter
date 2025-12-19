import { describe, expect, test } from '@rstest/core';
import { renderLitElement } from '@testing/lit.ts';
import { ChromeWebStoreButtonElement } from '@core/ui';
import './chrome-web-store-button';

describe('mjf-chrome-web-store-button', () => {
  let button: ChromeWebStoreButtonElement;

  renderLitElement('mjf-chrome-web-store-button', element => {
    button = element;
  });

  test('should have correct markup', () => {
    expect(button.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
