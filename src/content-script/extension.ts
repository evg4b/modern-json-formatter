import { createElement } from '@core/dom';
import { registerStyle } from '@core/ui/helpers';
import { isNotNull } from 'typed-assert';
import { buildDom } from './dom';
import { type Failure, JsonDocument, type Notice } from './document/json-document';
import { findNodeWithCode } from './json-detector';
import { type ContainerElement } from './ui/container/container';
import { type ErrorNodeElement } from './ui/error-node';
import './ui/toolbox';
import './ui/container/container';
import './ui/error-node';
import '@core/ui/floating-message';
import '@core/ui/sticky-panel';
import { getSettings, type ExtensionSettings } from '@core/settings';

import contentStyles from './content-script.scss?inline';
import rootStyles from './root-styles.scss?inline';

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
  const json = new JsonDocument(content, {
    url: globalThis.location.href,
    maxFileSize: settings.maxFileSize,
  });

  if (json.oversized) {
    preNode.remove();
    container.type = 'raw';
  } else {
    container.setRawContent(preNode);
    setTimeout(() => shadowRoot.appendChild(createToolbar(json, container, settings)));
  }

  const result = await withLoader(container, json.render());
  switch (result.type) {
    case 'tree':
      container.setFormattedContent(buildDom(result.node));
      break;
    case 'text':
      container.setRawContent(createElement({ element: 'pre', content: result.text }));
      showNotice(container, result.notice);
      break;
    case 'failure':
      if (json.oversized) {
        container.setRawContent(createErrorNode(result.failure));
      } else {
        container.setFormattedContent(createErrorNode(result.failure));
      }
      break;
  }
};

const createToolbar = (json: JsonDocument, container: ContainerElement, settings: ExtensionSettings): HTMLElement => {
  const toolbox = document.createElement('mjf-toolbox');
  toolbox.buttons = settings.buttons;
  toolbox.downloadMode = settings.downloadMode;

  toolbox.addEventListener('tab-changed', event => {
    container.type = event.detail;
  });

  toolbox.addEventListener('jq-query', async event => {
    toolbox.error = null;
    const result = await withLoader(container, json.query(event.detail));
    switch (result.type) {
      case 'tree':
        container.setQueryContent(buildDom(result.node));
        break;
      case 'invalid-query':
        toolbox.error = result.message;
        break;
      case 'notice':
        showNotice(container, result.notice);
        break;
    }
  });

  toolbox.addEventListener('download', async event => {
    const notice = await json.download(event.detail);
    if (notice) {
      showNotice(container, notice);
    }
  });

  const panel = document.createElement('mjf-sticky-panel');
  panel.appendChild(toolbox);

  return panel;
};

const withLoader = async <T>(container: ContainerElement, promise: Promise<T>): Promise<T> => {
  try {
    container.startLoading();
    return await promise;
  } finally {
    container.stopLoading();
  }
};

const showNotice = (container: ContainerElement, { header, content }: Notice) => {
  container.message(header, content);
};

const createErrorNode = ({ header, lines }: Failure): ErrorNodeElement => {
  const el = document.createElement('mjf-error-node');
  el.header = header;
  el.lines = lines;
  return el;
};
