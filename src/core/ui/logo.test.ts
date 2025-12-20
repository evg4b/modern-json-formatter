import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { LogoElement, type LogoSize } from '@core/ui';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';
import './logo';

describe('mjf-logo', () => {
  let logo: LogoElement;

  renderLitElement('mjf-logo', element => {
    logo = element;
  });

  defaultLitAsserts(LogoElement, () => logo);

  test('should have correct markup', () => {
    expect(logo.shadowRoot?.children).toMatchSnapshot();
  });

  test.for<LogoSize>(['512', '256', '128', '48', '32'])('should have correct size', async size => {
    logo.size = size;
    await logo.updateComplete;

    expect(logo.shadowRoot?.innerHTML)
      .toContain(`icon${size}.png`);
  });
});
