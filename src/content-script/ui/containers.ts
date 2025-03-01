import { createElement } from '@core/dom';

export const buildContainers = (root: ShadowRoot) => {
  const rootContainer = createElement({
    element: 'div',
    class: ['root-container', 'formatted'],
  });

  rootContainer.appendChild(createElement({ element: 'div', class: 'loader' }));

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
