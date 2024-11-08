import '@testing/svg.mock';
import { describe, expect, it } from '@jest/globals';
import { getShadowRoot } from '@testing/styled-component';
import { ChromeWebStoreButton } from './chrome-web-store-button';

describe('chrome-web-store-button', () => {
  it('should render button link', () => {
    const button = new ChromeWebStoreButton();
    button.attributeChangedCallback('href', '', 'https://google.com');
    button.attributeChangedCallback('title', '', 'Chrome Web Store');
    const root = getShadowRoot(button);
    expect(root.innerHTML).toMatchSnapshot();
  });
});
