import { describe, expect, test } from '@rstest/core';
import { LogoElement, type LogoSize } from '@core/ui';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import './logo';

describe('mjf-logo', () => {
  let logo: LogoElement;

  renderLitElement('mjf-logo', element => {
    logo = element;
  });

  defaultLitAsserts(LogoElement, () => logo);

  test('should render an svg element', () => {
    expect(logo.shadowRoot?.querySelector('svg')).not.toBeNull();
  });

  test.each<LogoSize>(['512', '256', '128', '48', '32'])('should set css variable for size %s', async size => {
    logo.size = size;
    await logo.updateComplete;

    expect(logo.style.getPropertyValue('--mjf-logo-size')).toBe(`${size}px`);
  });
});
