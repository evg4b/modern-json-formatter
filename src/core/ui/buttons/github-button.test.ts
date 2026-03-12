import '@testing/browser.mock';
import { describe, expect, test } from '@rstest/core';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';
import { GithubButtonElement } from '@core/ui';
import { BUTTONS } from '@core/constants';
import './github-button';

describe('mjf-github-button', () => {
  let button: GithubButtonElement;

  renderLitElement('mjf-github-button', element => {
    button = element;
  });

  defaultLitAsserts(GithubButtonElement, () => button);

  test('should render link to GitHub repo', () => {
    const anchor = button.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe(BUTTONS.GITHUB.URL);
  });
});
