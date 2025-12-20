import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';
import { GithubButtonElement } from '@core/ui';
import './github-button';

describe('mjf-github-button', () => {
  let button: GithubButtonElement;

  renderLitElement('mjf-github-button', element => {
    button = element;
  });

  defaultLitAsserts(GithubButtonElement, () => button);

  test.skip('should have correct markup', () => {
    expect(button.shadowRoot?.children).toMatchSnapshot();
  });
});
