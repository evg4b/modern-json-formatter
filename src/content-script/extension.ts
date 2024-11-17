import { jq, tokenize, type TokenizerResponse } from '@core/background';
import { registerStyles } from '@core/ui/helpers';
import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { buildErrorNode } from './dom/build-error-node';
import { detectJson, getJsonSelector } from './json-detector/detect';
import styles from './styles.module.scss';
import { buildContainers } from './ui/containers';
import { ToolboxElement } from './ui/toolbox';

export const runExtension = async () => {
  if (!(await detectJson())) {
    return;
  }

  const shadowRoot = document.body.attachShadow({ mode: 'open' });
  registerStyles(shadowRoot, styles);

  const data = document.querySelector<HTMLPreElement>(getJsonSelector());
  isNotNull(data, 'No data found');

  const { rootContainer, rawContainer, formatContainer, queryContainer } = buildContainers(shadowRoot);
  rawContainer.appendChild(data);

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
        const info = await jq(data.innerText, query);
        if (info.type === 'error' && info.scope === 'jq') {
          toolbox.setErrorMessage(info.error);
          return;
        }

        queryContainer.innerHTML = '';
        queryContainer.appendChild(prepareResponse(info));
      })(query)
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

  await wrapper(tokenize(data.innerText).then(response => formatContainer.appendChild(prepareResponse(response))));
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error' ? buildErrorNode('Invalid JSON file.', response.error) : buildDom(response);
};
