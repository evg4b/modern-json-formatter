import { download, format, jq, pushHistory, tokenize, type TokenizerResponse } from '@core/background';
import { createElement } from '@core/dom';
import { registerStyle } from '@core/ui/helpers';
import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { extractFileName, isErrorNode } from './helpers';
import { findNodeWithCode } from './json-detector';
import { type TabChangedEvent } from './ui/toolbox/toolbox';
import { type ErrorNodeElement } from './ui/error-node';
import './ui/toolbox';
import './ui/container/container';
import './ui/error-node';
import '@core/ui/floating-message';
import '@core/ui/sticky-panel';

import contentStyles from './content-script.scss?inline';
import rootStyles from './root-styles.scss?inline';

export const ONE_MEGABYTE_LENGTH = 927182; // This is approximately 1MB
export const LIMIT = ONE_MEGABYTE_LENGTH * 3;

export const runExtension = async () => {
  const preNode = await findNodeWithCode();
  if (!preNode) {
    return;
  }

  registerStyle(document.head, rootStyles);

  // eslint-disable-next-line wc/no-closed-shadow-root
  const shadowRoot = document.body.attachShadow({ mode: 'closed' });
  registerStyle(shadowRoot, contentStyles);

  const content = preNode.textContent;
  isNotNull(content, 'No data found');

  const container = document.createElement('mjf-container');

  shadowRoot.appendChild(container);

  if (content.length > LIMIT) {
    preNode.remove();

    try {
      const formatted = await format(content);
      if (typeof formatted === 'object') {
        container.type = 'raw';
        container.setRawContent(createErrorNode('Invalid JSON file.', formatted.error));
        return;
      }

      container.setRawContent(createElement({
        element: 'pre',
        content: formatted,
      }));
    } catch (error: unknown) {
      container.setError(error);
      return;
    } finally {
      container.stopLoading();
    }

    container.message(
      'File is too large',
      'File is too large to be processed (More than 3MB). It has been formatted instead.',
    );

    return;
  }

  container.setRawContent(preNode);

  const wrapper = async <T>(promise: Promise<T>): Promise<T> => {
    try {
      container.startLoading();
      return await promise;
    } finally {
      container.stopLoading();
    }
  };

  setTimeout(() => {
    const toolbox = document.createElement('mjf-toolbox');
    const panel = document.createElement('mjf-sticky-panel');
    panel.appendChild(toolbox);

    toolbox.addEventListener('tab-changed', (event: TabChangedEvent) => {
      container.type = event.detail;
    });

    toolbox.addEventListener('jq-query', async event => {
      await wrapper(jqQuery(event.detail));
    });

    toolbox.addEventListener('download', async event => {
      const filename = extractFileName(location.toString());
      const suffix = event.detail === 'raw' ? '' : `_${event.detail}`;
      try {
        await download(event.detail, preNode.innerText, `${filename}${suffix}.json`);
      } catch (error: unknown) {
        container.message(
          'Unable to download file',
          // @ts-expect-error incorrect typeing
          error?.error ?? error?.message ?? error,
        );
      }
    });

    shadowRoot.appendChild(panel);

    const jqQuery = async (query: string) => {
      toolbox.error = null;
      try {
        const info = await jq(preNode.innerText, query);
        container.setQueryContent(prepareResponse(info));
        await pushHistory(globalThis.location.hostname, query);
      } catch (error: unknown) {
        if (isErrorNode(error)) {
          if (error.scope === 'jq') {
            toolbox.error = error.error;
            return;
          }

          container.message(
            `Error ${error.error} in ${error.scope}`,
            error.stack ? `Stack trace: ${error.stack}` : '',
          );

          return;
        }

        console.error(error);
      }
    };
  });

  try {
    const response = await wrapper(tokenize(preNode.innerText));
    container.setFormattedContent(prepareResponse(response));
  } catch (error: unknown) {
    container.setError(error);
  } finally {
    container.stopLoading();
  }
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error'
    ? createErrorNode('Invalid JSON file.', response.error)
    : buildDom(response);
};

const createErrorNode = (header: string, ...lines: string[]): ErrorNodeElement => {
  const el = document.createElement('mjf-error-node') as ErrorNodeElement;
  el.header = header;
  el.lines = lines;
  return el;
};
