import { ErrorNode, TokenizerResponse } from '@packages/tokenizer';
import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { buildErrorNode } from './dom/build-error-node';
import { detectJson, getJsonSelector } from './json-detector/detect';
import styles from './styles.module.scss';
import { buildButtons } from './ui/buttons';
import { buildContainers } from './ui/containers';

export const runExtension = async () => {
  if (!(await detectJson())) {
    return;
  }

  const { tokenize } = await import('@packages/tokenizer');

  const shadow = document.body.attachShadow({ mode: 'open' });
  const styleNode = document.createElement('style');
  styleNode.textContent = styles;
  styleNode.setAttribute('type', 'text/css');
  styleNode.setAttribute('rel', 'stylesheet');
  styleNode.setAttribute('role', 'presentation');

  shadow.appendChild(styleNode);

  const data = document.querySelector<HTMLPreElement>(getJsonSelector());
  isNotNull(data, 'No data found');

  const { rootContainer, rawContainer, formatContainer, queryContainer } = buildContainers(shadow);
  rawContainer.appendChild(data);

  const { rawButton, queryButton, formatButton, queryInput, queryInputWrapper } = buildButtons(shadow);

  const response = await tokenize(data.innerText);

  queryInputWrapper.style.display = 'none';
  rawButton.addEventListener('click', () => {
    rootContainer.classList.remove('formatted', 'query');
    rootContainer.classList.add('raw');
    queryInputWrapper.style.display = 'none';
  });

  formatButton.addEventListener('click', () => {
    rootContainer.classList.remove('raw', 'query');
    rootContainer.classList.add('formatted');
    queryInputWrapper.style.display = 'none';
  });

  queryButton.addEventListener('click', () => {
    rootContainer.classList.remove('raw', 'formatted');
    rootContainer.classList.add('query');
    queryInputWrapper.style.display = 'flex';
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  queryInput.addEventListener('keydown', async event => {
    if (event.key === 'Enter') {
      const { jq } = await import('@packages/jq');

      const info = await jq(data.innerText, queryInput.value);
      queryContainer.innerHTML = '';
      queryContainer.appendChild(prepareResponse(info));
    }
  });

  formatContainer.appendChild(prepareResponse(response));
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error'
    ? buildErrorNode(extractHeader(response), extractLines(response))
    : buildDom(response);
};

const extractLines = (response: ErrorNode) => response.error;

const extractHeader = (response: ErrorNode): string =>
  response.scope === 'tokenizer' ? 'Invalid JSON file.' : 'Invalid JQ Query.';
