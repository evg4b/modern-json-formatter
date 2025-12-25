export const registerStyle = (shadowRoot: ShadowRoot | HTMLHeadElement, styles: string) => {
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;
  styleNode.setAttribute('type', 'text/css');
  styleNode.setAttribute('rel', 'stylesheet');
  styleNode.setAttribute('role', 'presentation');
  shadowRoot.appendChild(styleNode);

  return styleNode;
};
