import '@testing/svg.mock';
import { describe, expect, it } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { KoFiButton } from './ko-fi-button';

describe('ko-fi-button', () => {
  it('should render button link', () => {
    const button = new KoFiButton();
    button.attributeChangedCallback('href', '', 'https://ko-fo.com');
    button.attributeChangedCallback('title', '', 'Support the project');
    const root = getShadowRoot(button);
    expect(root.innerHTML).toMatchSnapshot();
  });
});
