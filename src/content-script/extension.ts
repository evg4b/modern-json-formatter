import { download, format, jq, pushHistory, tokenize, type TokenizerResponse } from '@core/background';
import { createElement } from '@core/dom';
import { registerStyle } from '@core/ui/helpers';
import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { extractDomainKey, extractFileName, getErrorMessage, isErrorNode } from './helpers';
import { findNodeWithCode } from './json-detector';
import { type TabChangedEvent } from './ui/toolbox/toolbox';
import { type ErrorNodeElement } from './ui/error-node';
import { type ContainerElement } from './ui/container/container';
import './ui/toolbox';
import './ui/container/container';
import './ui/error-node';
import '@core/ui/floating-message';
import '@core/ui/sticky-panel';
import { type ExtensionSettings, getSettings } from '@core/settings';

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

  const settings = await getSettings();
  const limit = settings.maxFileSize * ONE_MEGABYTE_LENGTH;

  if (content.length > limit) {
    preNode.remove();
    container.type = 'raw';

    try {
      const formatted = await format(content);
      if (typeof formatted === 'object') {
        container.setRawContent(createErrorNode('Invalid JSON file.', formatted.error));
        container.stopLoading();
        return;
      }

      container.setRawContent(createElement({
        element: 'pre',
        content: formatted,
      }));
    } catch (error: unknown) {
      container.setRawContent(createErrorNode('Failed to process file', getErrorMessage(error)));
      container.stopLoading();
      return;
    }

    container.stopLoading();
    container.message(
      'File is too large',
      `File is too large to be processed (More than ${settings.maxFileSize}MB). It has been formatted instead.`,
    );

    return;
  }

  container.setRawContent(preNode);

  setTimeout(() => {
    shadowRoot.appendChild(createToolbar(container, () => preNode.innerText, settings));
  });

  try {
    const response = await withLoading(container, tokenize(preNode.innerText));
    container.setFormattedContent(prepareResponse(response));
  } catch (error: unknown) {
    container.setError(error);
  } finally {
    container.stopLoading();
  }
};

export const withLoading = async <T>(container: ContainerElement, promise: Promise<T>): Promise<T> => {
  try {
    container.startLoading();
    return await promise;
  } finally {
    container.stopLoading();
  }
};

export const createToolbar = (
  container: ContainerElement,
  getContent: () => string,
  { buttons, downloadMode }: Pick<ExtensionSettings, 'buttons' | 'downloadMode'>,
): HTMLElement => {
  const toolbox = document.createElement('mjf-toolbox');
  toolbox.buttons = buttons;
  toolbox.downloadMode = downloadMode;
  const panel = document.createElement('mjf-sticky-panel');
  panel.appendChild(toolbox);

  const jqQuery = async (query: string) => {
    toolbox.error = null;
    try {
      const info = await jq(getContent(), query);
      container.setQueryContent(prepareResponse(info));
      await pushHistory(extractDomainKey(globalThis.location.href), query);
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

  toolbox.addEventListener('tab-changed', (event: TabChangedEvent) => {
    container.type = event.detail;
  });

  toolbox.addEventListener('jq-query', async event => {
    await withLoading(container, jqQuery(event.detail));
  });

  toolbox.addEventListener('download', async event => {
    const filename = extractFileName(location.toString());
    const suffix = event.detail === 'raw' ? '' : `_${event.detail}`;
    try {
      await download(event.detail, getContent(), `${filename}${suffix}.json`);
    } catch (error: unknown) {
      container.message(
        'Unable to download file',
        // @ts-expect-error incorrect typing
        error?.error ?? error?.message ?? error,
      );
    }
  });

  return panel;
};

export const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error'
    ? createErrorNode('Invalid JSON file.', response.error)
    : buildDom(response);
};

export const createErrorNode = (header: string, ...lines: string[]): ErrorNodeElement => {
  const el = document.createElement('mjf-error-node') as ErrorNodeElement;
  el.header = header;
  el.lines = lines;
  return el;
};
