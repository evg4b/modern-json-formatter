import '../faq/buttons/github-button';
import '../faq/buttons/chrome-web-store-button';
import '../faq/buttons/ko-fi-button';
import { clearHistory, getDomains } from '@core/background';
import { createElement } from '@core/dom';
import { throws } from '../content-script/helpers';

const load = async () => {
  const domains = await getDomains();
  const tbody = document.querySelector('.history tbody') ?? throws('No .domains element found');
  tbody.innerHTML = '';
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  for (const domain of domains) {
    const row = createElement({
      element: 'tr',
      children: [
        createElement({ element: 'td', content: domain }),
        createElement({ element: 'td', content: domain }),
      ],
    });

    tbody.appendChild(row);
  }

  if (domains.length === 0) {
    const row = createElement({
      element: 'tr',
      class: 'empty-row',
      children: [
        createElement({
          element: 'td',
          content: 'No history',
          attributes: { colspan: '2' },
        }),
      ],
    });

    tbody.appendChild(row);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('.clear')?.addEventListener('click', async () => {
    await clearHistory('domains');
    await load();
  });

  await load();
});
