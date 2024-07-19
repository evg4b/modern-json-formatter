import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { buildErrorNode } from './dom/build-error-node';
import styles from './styles.scss';
import { buildButtons } from './ui/buttons';
import { buildContainers } from './ui/containers';

export const runExtension = async () => {
  if (!document.querySelector('pre + .json-formatter-container')) {
    return;
  }

  const { tokenize } = await import('@tokenizer');

  const shadow = document.body.attachShadow({ mode: 'open' });
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;

  shadow.appendChild(styleNode);

  const data = document.querySelector<HTMLPreElement>('body > pre');
  isNotNull(data, 'No data found');

  const { rootContainer, rawContainer, formatContainer, queryContainer } = buildContainers(shadow);
  rawContainer.appendChild(data);

  const { rawButton, queryButton, formatButton, queryInput } = buildButtons(shadow);

  const response = await tokenize(data.innerText);

  queryInput.style.display = 'none';
  rawButton.addEventListener('click', () => {
    rootContainer.classList.remove('formatted', 'query');
    rootContainer.classList.add('raw');
    queryInput.style.display = 'none';
  });

  formatButton.addEventListener('click', () => {
    rootContainer.classList.remove('raw', 'query');
    rootContainer.classList.add('formatted');
    queryInput.style.display = 'none';
  });

  queryButton.addEventListener('click', async () => {
    rootContainer.classList.remove('raw', 'formatted');
    rootContainer.classList.add('query');
    queryInput.style.display = 'inline-block';

    queryContainer.innerHTML = '...';
  });

  queryInput.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    const { jq } = await import('@jq');

    const info = await jq(data.innerText, queryInput.value);
    queryContainer.innerHTML = '';
    queryContainer.appendChild(
      prepareResponse(info),
    );
  });

  formatContainer.appendChild(
    prepareResponse(response),
  );
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  if (response.type === 'error') {
    console.error('Error parsing JSON:', response.error);

    return buildErrorNode();
  }

  return buildDom(response);
};
