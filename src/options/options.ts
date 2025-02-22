import { clearHistory, getDomains } from '@core/background';
import { createElement } from '@core/dom';
import { throws } from '../content-script/helpers';

const load = async () => {
  const domains = await getDomains();
  const container = document.querySelector('.history tbody') ?? throws('No .domains element found');
  container.childNodes.forEach((node) => node.remove());
  for (const domain of domains) {
    const row = createElement({
      element: 'tr',
      children: [
        createElement({ element: 'td', content: domain }),
        createElement({ element: 'td', content: domain }),
      ],
    });

    container.appendChild(row);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('.clear')?.addEventListener('click', async () => {
    await clearHistory('domains');
    await load();
  });

  await load();
});
