import { createElement } from '@core/dom';

export const registerStyle = (shadowRoot: ShadowRoot, styles: string) => {
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;
  styleNode.setAttribute('type', 'text/css');
  styleNode.setAttribute('rel', 'stylesheet');
  styleNode.setAttribute('role', 'presentation');
  shadowRoot.appendChild(styleNode);

  return styleNode;
};

export const registerStyleLink = (shadowRoot: ShadowRoot, url: string) => {
  const linkNode = createElement({
    element: 'link',
    attributes: {
      href: url,
      type: 'text/css',
      rel: 'stylesheet',
      role: 'presentation',
    },
  });

  shadowRoot.appendChild(linkNode);

  return linkNode;
};
