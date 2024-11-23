import { format, jq, tokenize, type TokenizerResponse } from '@core/background';
import { createElement } from '@core/dom';
import { registerStyles } from '@core/ui/helpers';
import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { buildErrorNode } from './dom/build-error-node';
import { findNodeWithCode } from './json-detector';
import styles from './styles.module.scss';
import { buildContainers } from './ui/containers';
import { FloatingMessageElement } from './ui/floating-message';
import { ToolboxElement } from './ui/toolbox';

const ONE_MEGABYTE_LENGTH = 927182;
const LIMIT = ONE_MEGABYTE_LENGTH * 3;

export const runExtension = async () => {
  const preNode = await findNodeWithCode();
  if (!preNode) {
    return;
  }

  const shadowRoot = document.body.attachShadow({ mode: 'open' });
  registerStyles(shadowRoot, styles);

  const content = preNode.textContent;
  isNotNull(content, 'No data found');

  const { rootContainer, rawContainer, formatContainer, queryContainer } = buildContainers(shadowRoot);

  if (content.length > LIMIT) {
    preNode.remove();

    rootContainer.classList.remove('formatted', 'query');
    rootContainer.classList.add('raw');

    const formatted = await format(content);
    if (typeof formatted === 'object') {
      return rawContainer.appendChild(buildErrorNode('Invalid JSON file.', formatted.error));
    }

    rawContainer.appendChild(createElement({
      element: 'pre',
      content: formatted,
    }));

    rootContainer.appendChild(new FloatingMessageElement(
      'File is too large',
      'File is too large to be processed (More than 3MB). It has been formatted instead.',
    ));

    return;
  }

  rawContainer.appendChild(preNode);

  const wrapper = async <T>(promise: Promise<T>): Promise<T> => {
    rootContainer.classList.add('loading');
    try {
      return await promise;
    } finally {
      rootContainer.classList.remove('loading');
    }
  };

  const toolbox = new ToolboxElement();
  shadowRoot.appendChild(toolbox);

  toolbox.onQueryChanged(async query => {
    await wrapper(
      (async (query: string) => {
        const info = await jq(preNode.innerText, query);
        if (info.type === 'error' && info.scope === 'jq') {
          toolbox.setErrorMessage(info.error);
          return;
        }

        queryContainer.innerHTML = '';
        queryContainer.appendChild(prepareResponse(info));
      })(query),
    );
  });

  toolbox.onTabChanged(tab => {
    switch (tab) {
      case 'query':
        rootContainer.classList.remove('raw', 'formatted');
        rootContainer.classList.add('query');
        return;
      case 'raw':
        rootContainer.classList.remove('formatted', 'query');
        rootContainer.classList.add('raw');
        return;
      case 'formatted':
        rootContainer.classList.remove('raw', 'query');
        rootContainer.classList.add('formatted');
        return;
    }
  });

  await wrapper(tokenize(preNode.innerText).then(response => formatContainer.appendChild(prepareResponse(response))));
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error' ? buildErrorNode('Invalid JSON file.', response.error) : buildDom(response);
};
