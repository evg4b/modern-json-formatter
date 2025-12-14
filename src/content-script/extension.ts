import { format, jq, pushHistory, tokenize, type TokenizerResponse } from '@core/background';
import { resource } from '@core/browser';
import { createElement } from '@core/dom';
import { registerStyle, registerStyleLink } from '@core/ui/helpers';
import { isNotNull } from 'typed-assert';
import { buildDom, buildErrorNode } from './dom';
import { isErrorNode } from './helpers';
import { findNodeWithCode } from './json-detector';
import { buildContainers, FloatingMessageElement, ToolboxElement } from './ui';
import './ui/toolbox';
import './ui/sticky-panel/sticky-panel.ts';
import { TabChangedEvent } from "./ui/toolbox/toolbox.ts";

export const ONE_MEGABYTE_LENGTH = 927182; // This is approximately 1MB
export const LIMIT = ONE_MEGABYTE_LENGTH * 3;

const staticStyles = `:host {
  background-color: var(--background, #282828);
  color: var(--base-text-color, #282828);
  display: block;
  @media (prefers-color-scheme: light) {
    background-color: var(--background, #f3f3f3);
    color: var(--base-text-color, #1f1f1f);
  }
}`;

export const runExtension = async () => {
  const preNode = await findNodeWithCode();
  if (!preNode) {
    return;
  }

  const shadowRoot = document.body.attachShadow({ mode: 'closed' });
  registerStyle(shadowRoot, staticStyles);
  registerStyleLink(shadowRoot, resource('content-styles.css'));

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

    rootContainer.classList.remove('loading');

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

  setTimeout(() => {
    const toolboxOld = new ToolboxElement();
    const toolbox = document.createElement('mjf-toolbox');
    const panel = document.createElement('mjf-sticky-panel');
    panel.appendChild(toolboxOld);
    panel.appendChild(toolbox);


    toolbox.addEventListener('tab-changed', (event: TabChangedEvent) => {
      switch (event.detail) {
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
    })

    shadowRoot.appendChild(panel);

    const jqQuery = async (query: string) => {
      try {
        const info = await jq(preNode.innerText, query);
        queryContainer.innerHTML = '';
        queryContainer.appendChild(prepareResponse(info));
        await pushHistory(window.location.hostname, query);
      } catch (error: unknown) {
        if (isErrorNode(error)) {
          if (error.scope === 'jq') {
            toolboxOld.setErrorMessage(error.error);
            return;
          }

          rootContainer.appendChild(new FloatingMessageElement(
            `Error ${ error.error } in ${ error.scope }`,
            error.stack ? `Stack trace: ${ error.stack }` : '',
            'error-message',
          ));
        }

        console.error(error);
      }
    };

    toolboxOld.onQueryChanged(async query => {
      await wrapper(jqQuery(query));
    });

    toolboxOld.onTabChanged(tab => {
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
  });

  const response = await wrapper(tokenize(preNode.innerText));
  formatContainer.appendChild(
    prepareResponse(response),
  );
  rootContainer.classList.remove('loading');
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error'
    ? buildErrorNode('Invalid JSON file.', response.error)
    : buildDom(response);
};

