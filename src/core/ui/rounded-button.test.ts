import { describe, expect, test } from '@rstest/core';
import { RoundedButtonElement } from '@core/ui';
import { renderLitElement } from '@testing/lit.ts';
import './rounded-button';

describe('mjf-rounded-button', () => {
  let button: RoundedButtonElement;

  renderLitElement('mjf-rounded-button', element => {
    button = element;
  });

  test('should have correct markup for empty buttons', () => {
    expect(button.shadowRoot?.innerHTML).toMatchSnapshot();
  });

  test('should have correct markup for button with test', () => {
    button.innerText = 'Test';

    expect(button.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
