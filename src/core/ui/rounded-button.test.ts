import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { RoundedButtonElement } from '@core/ui';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import './rounded-button';

describe('mjf-rounded-button', () => {
  let button: RoundedButtonElement;

  renderLitElement('mjf-rounded-button', element => {
    button = element;
  });

  defaultLitAsserts(RoundedButtonElement, () => button);
});
