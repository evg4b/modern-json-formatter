import { registerStyle, registerStyleLink } from '@core/ui/helpers/styles';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('registerStyle', () => {
  let shadowRoot: ShadowRoot;
  let styleElement: HTMLStyleElement;

  beforeAll(() => {
    const host = document.createElement('div');
    shadowRoot = host.attachShadow({ mode: 'open' });
    styleElement = registerStyle(shadowRoot, `
      :host {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        justify-content: center;  
      }
    `);
  });

  it('should return the style node', () => {
    expect(styleElement).toMatchSnapshot();
  });

  it('should attach the style node to the shadow root', () => {
    expect(shadowRoot.innerHTML).toMatchSnapshot();
  });
});

describe('registerStyleLink', () => {
  let shadowRoot: ShadowRoot;
  let linkElement: HTMLLinkElement;

  beforeAll(() => {
    const host = document.createElement('div');
    shadowRoot = host.attachShadow({ mode: 'open' });
    linkElement = registerStyleLink(shadowRoot, `/css/content-styles.css`);
  });

  it('should return the link node', () => {
    expect(linkElement).toMatchSnapshot();
  });

  it('should render the lint to style', () => {
    expect(shadowRoot.innerHTML).toMatchSnapshot();
  });
});
