import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { LogoElement } from '@core/ui';
import { renderLitElement } from '@testing/lit.ts';
import './logo';

describe('mjf-logo', () => {
  let logo: LogoElement;

  renderLitElement('mjf-logo', element => {
    logo = element;
  });

  test('should have correct markup', () => {
    expect(logo.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
