import { createElement } from '@core/dom';

export const registerStyles = (shadowRoot: ShadowRoot, styles: string) => {
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;
  styleNode.setAttribute('type', 'text/css');
  styleNode.setAttribute('rel', 'stylesheet');
  styleNode.setAttribute('role', 'presentation');
  shadowRoot.appendChild(styleNode);

  return styleNode;
};

export const importStyles = (shadowRoot: ShadowRoot, url: string) => {
  shadowRoot.appendChild(createElement({
    element: 'link',
    attributes: {
      href: url,
      type: 'text/css',
      rel: 'stylesheet',
      role: 'presentation',
    },
  }));
};
