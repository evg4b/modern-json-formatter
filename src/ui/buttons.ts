export const buildButtons = (root: ShadowRoot) => {
  const container = document.createElement('div');
  container.className = 'button-container';

  const formatButton = document.createElement('button');
  formatButton.textContent = 'Formatted';
  formatButton.classList.add('active');

  const queryButton = document.createElement('button');
  queryButton.textContent = 'Query';

  const rawButton = document.createElement('button');
  rawButton.textContent = 'Raw';

  const queryInput = document.createElement('input');
  queryInput.type = 'text';
  queryInput.placeholder = 'JQ Query';
  queryInput.className = 'jq-query-input';

  container.appendChild(queryInput);
  container.appendChild(queryButton);
  container.appendChild(formatButton);
  container.appendChild(rawButton);

  const buttons = [formatButton, rawButton, queryButton];

  container.addEventListener('click', (event) => {
    if (event.target instanceof HTMLButtonElement) {
      for (const button of buttons) {
        if (button === event.target) {
          button.classList.add('active');
          continue;
        }

        button.classList.remove('active');
      }
    }
  });

  root.appendChild(container);

  return {
    queryButton,
    formatButton,
    rawButton,
    queryInput,
  };
};
