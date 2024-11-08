import '@testing/svg.mock';
import { describe, expect, it } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { GithubButton } from './github-button';

describe('github-button', () => {
  it('should render button link', () => {
    const button = new GithubButton();
    button.attributeChangedCallback('href', '', 'https://githib.com');
    button.attributeChangedCallback('title', '', 'Github Repo');
    const root = getShadowRoot(button);
    expect(root.innerHTML).toMatchSnapshot();
  });
});
