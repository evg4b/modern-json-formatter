export const buildButtons = (root: ShadowRoot) => {
  const container = document.createElement('div');
  container.className = 'button-container';
  const formatButton = document.createElement('button');
  formatButton.textContent = 'Formatted';
  formatButton.classList.add('active');

  const rawButton = document.createElement('button');
  rawButton.textContent = 'Raw';

  container.appendChild(formatButton);
  container.appendChild(rawButton);

  const buttons = [formatButton, rawButton];

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

  return { formatButton, rawButton };
};
