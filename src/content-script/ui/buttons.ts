import { query } from '../helpres';
import { getURL } from '@core/browser';
import { ToolboxElement } from './toolbox';

export const buildButtons = (root: ShadowRoot) => {
  const toolbox = document.createElement('div');
  toolbox.innerHTML = `
    <div class="toolbox-container" style="display: none">
        <div class="input-wrapper" style="display: none" >
            <a href="${getURL('faq.html')}" title="JQ Queries Manual" target="_blank">
                <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7.00999V7M12 17L12 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
            <input type="text" class="toolbox-input" placeholder="JQ Query">
        </div>
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
  const queryInputWrapper = query<HTMLDivElement>(toolbox, '.input-wrapper');

  const buttons = [formatButton, rawButton, queryButton];

  container.addEventListener('click', event => {
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
    queryInputWrapper,
  };
};
