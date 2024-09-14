import { query } from '../helpres';

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

  const container = query<HTMLDivElement>(toolbox, '.button-container');
  const formatButton = query<HTMLButtonElement>(toolbox, '.formatted-button');
  const queryButton = query<HTMLButtonElement>(toolbox, '.query-button');
  const rawButton = query<HTMLButtonElement>(toolbox, '.raw-button');
  const queryInput = query<HTMLInputElement>(toolbox, 'input');

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
