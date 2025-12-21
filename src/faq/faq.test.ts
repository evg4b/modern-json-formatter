import '@testing/browser.mock';
import { describe } from '@rstest/core';
import { FaqPageElement } from './faq.ts';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';

describe('mjf-faq-page', () => {
  let faqPageElement: FaqPageElement;

  renderLitElement('mjf-faq-page', element => faqPageElement = element);

  defaultLitAsserts(FaqPageElement, () => faqPageElement);
});
