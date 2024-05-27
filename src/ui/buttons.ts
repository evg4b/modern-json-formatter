export const buildButtons = (root: ShadowRoot) => {
  const container = document.createElement('div');
  container.className = 'button-container';
  const formatButton = document.createElement('button');
  formatButton.textContent = 'Formatted';
  formatButton.classList.add('active');

  const rawButton = document.createElement('button');
  rawButton.textContent = 'Raw';

  const queryButton = document.createElement('button');
  queryButton.textContent = 'Query';

  const queryInput = document.createElement('input');
  queryInput.type = 'text';
  queryInput.placeholder = 'Enter query here...';
  queryInput.className = 'query-input';
  queryInput.style.display = 'none';

  container.append(
    queryInput,
    queryButton,
    formatButton,
    rawButton,
  );


  const buttons = [queryButton, formatButton, rawButton];

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

  return { queryInput, queryButton, formatButton, rawButton };
};
