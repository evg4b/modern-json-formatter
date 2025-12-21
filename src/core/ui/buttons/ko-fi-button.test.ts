import '@testing/browser.mock';
import { describe } from '@rstest/core';
import { KoFiButtonElement } from '@core/ui';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';
import './ko-fi-button';

describe('mjf-ko-fi-button', () => {
  let button: KoFiButtonElement;

  renderLitElement('mjf-ko-fi-button', element => {
    button = element;
  });

  defaultLitAsserts(KoFiButtonElement, () => button);
});
