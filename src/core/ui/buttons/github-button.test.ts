import { describe, expect, test } from '@rstest/core';
import { renderLitElement } from '@testing/lit.ts';
import { GithubButtonElement } from '@core/ui';
import './github-button';

describe('mjf-github-button', () => {
  let button: GithubButtonElement;

  renderLitElement('mjf-github-button', element => {
    button = element;
  });

  test('should have correct markup', () => {
    expect(button.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
