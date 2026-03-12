import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { FaqPageElement } from './faq';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';

describe('mjf-faq-page', () => {
  let faqPageElement: FaqPageElement;

  renderLitElement('mjf-faq-page', element => faqPageElement = element);

  defaultLitAsserts(FaqPageElement, () => faqPageElement);

  test('should render sidebar and content', () => {
    const root = faqPageElement.shadowRoot;
    expect(root?.querySelector('mjf-sidebar')).not.toBeNull();
    expect(root?.querySelector('mjf-content')).not.toBeNull();
  });
});
