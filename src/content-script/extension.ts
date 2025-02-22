import { format, jq, tokenize, type TokenizerResponse } from '@core/background';
import { createElement } from '@core/dom';
import { registerStyles } from '@core/ui/helpers';
import { ErrorNode } from '@worker-core';
import { isNotNull } from 'typed-assert';
import { buildDom, buildErrorNode } from './dom';
import { findNodeWithCode } from './json-detector';
import styles from './styles.module.scss';
import { buildContainers, FloatingMessageElement, ToolboxElement } from './ui';

const ONE_MEGABYTE_LENGTH = 927182; // This is approximately 1MB
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

  const jqQuery = async (query: string) => {
    try {
      const info = await jq(preNode.innerText, query);
      queryContainer.innerHTML = '';
      queryContainer.appendChild(prepareResponse(info));
      // @ts-ignore
    } catch (error: ErrorNode) {
      if (error.scope === 'jq') {
        toolbox.setErrorMessage(error.error);
        return;
      }

      console.error(error);
    }
  };

  toolbox.onQueryChanged(async query => {
    await wrapper(jqQuery(query));
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

  await wrapper(tokenize(preNode.innerText)
    .then(response => prepareResponse(response))
    .then(element => formatContainer.appendChild(element)));
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error'
    ? buildErrorNode('Invalid JSON file.', response.error)
    : buildDom(response);
};
