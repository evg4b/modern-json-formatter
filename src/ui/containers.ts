export const buildContainers = (root: ShadowRoot) => {
  const rootContainer = document.createElement('div');
  rootContainer.className = 'root-container';

  const formatContainer = document.createElement('div');
  formatContainer.className = 'formatted-json-container';
  rootContainer.appendChild(formatContainer);

  const rawContainer = document.createElement('div');
  rawContainer.className = 'raw-json-container';
  rootContainer.appendChild(rawContainer);

  root.appendChild(rootContainer);

  return { rootContainer, formatContainer, rawContainer };
};
