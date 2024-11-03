export const buildContainers = (root: ShadowRoot) => {
  const rootContainer = document.createElement('div');
  rootContainer.className = 'root-container';

  const formatContainer = document.createElement('div');
  formatContainer.className = 'formatted-json-container';
  rootContainer.appendChild(formatContainer);

  const rawContainer = document.createElement('div');
  rawContainer.className = 'raw-json-container';
  rootContainer.appendChild(rawContainer);

  const queryContainer = document.createElement('div');
  queryContainer.className = 'query-json-container';
  rootContainer.appendChild(queryContainer);

  root.appendChild(rootContainer);

  return { rootContainer, formatContainer, rawContainer, queryContainer };
};
