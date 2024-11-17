import { jq, tokenize, type TokenizerResponse } from '@core/background';
import { registerStyles } from '@core/ui/helpers';
import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { buildErrorNode } from './dom/build-error-node';
import { findNodeWithCode } from './json-detector';
import styles from './styles.module.scss';
import { buildContainers } from './ui/containers';
import { ToolboxElement } from './ui/toolbox';

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
