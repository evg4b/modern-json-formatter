import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { KoFiButtonElement } from '@core/ui';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { BUTTONS } from '@core/constants';
import './ko-fi-button';

describe('mjf-ko-fi-button', () => {
  let button: KoFiButtonElement;

  renderLitElement('mjf-ko-fi-button', element => {
    button = element;
  });

  defaultLitAsserts(KoFiButtonElement, () => button);

  test('should render link to Ko-Fi', () => {
    const anchor = button.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe(BUTTONS.KO_FI.URL);
  });
});
