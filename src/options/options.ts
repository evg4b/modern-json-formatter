import '../faq/buttons/github-button';
import '../faq/buttons/chrome-web-store-button';
import '../faq/buttons/ko-fi-button';
import { clearHistory, getDomains } from '@core/background';
import { createElement } from '@core/dom';
import { throws } from '../content-script/helpers';

const load = async () => {
  const domainInfos = await getDomains();
  const tbody = document.querySelector('.history tbody') ?? throws('No .domains element found');
  tbody.innerHTML = '';
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  for (const info of domainInfos) {
    const row = createElement({
      element: 'tr',
      children: [
        createElement({ element: 'td', content: info.domain }),
        createElement({
          element: 'td',
          content: info.count > 1
            ? `${ info.count } queries`
            : `${ info.count } query`,
        }),
      ],
    });

    tbody.appendChild(row);
  }

  if (domainInfos.length === 0) {
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
    await clearHistory();
    await load();
  });

  await load();
});
