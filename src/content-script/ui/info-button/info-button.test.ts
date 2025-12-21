import { describe } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { InfoButtonElement } from './info-buton';

describe('mjf-info-button', () => {
  let infoButtonElement: InfoButtonElement;

  renderLitElement('mjf-info-button', element => infoButtonElement = element);

  defaultLitAsserts(InfoButtonElement, () => infoButtonElement);
});
