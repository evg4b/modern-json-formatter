import { throws } from '../helpres';

export const buildButtons = (root: ShadowRoot) => {
  const toolbox = document.createElement('div');
  toolbox.innerHTML = `
    <div class="toolbox-container">
        <input type="text" style="display: none" class="toolbox-input" placeholder="JQ Query">
        <div class="button-container">
            <button class="query-button">Query</button>
            <button class="formatted-button active">Formatted</button>
            <button class="raw-button">Raw</button>
        </div>
    </div>
  `;

  const container = toolbox.querySelector('.button-container') ?? throws('No button container found');

  const formatButton = toolbox.querySelector<HTMLButtonElement>('.formatted-button')
    ?? throws('No formatted button found');
  const queryButton = toolbox.querySelector<HTMLButtonElement>('.query-button')
    ?? throws('No query button found');
  const rawButton = toolbox.querySelector<HTMLButtonElement>('.raw-button')
    ?? throws('No raw button found');
  const queryInput = toolbox.querySelector<HTMLInputElement>('input')
    ?? throws('No input found');

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

  root.appendChild(toolbox);

  return {
    queryButton,
    formatButton,
    rawButton,
    queryInput,
  };
};
