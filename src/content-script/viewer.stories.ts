import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { download, jq, pushHistory, tokenize, type TokenizerResponse } from '@core/background';
import { createElement } from '@core/dom';
import { DEFAULT_SETTINGS, type DownloadMode, type ToolbarButtonsSettings } from '@core/settings';
import { withContainer } from '@testing/storybook';
import { buildDom } from './dom';
import { extractDomainKey, isErrorNode } from './helpers';
import './ui/container';
import './ui/error-node';
import './ui/toolbox';
import '@core/ui/sticky-panel';

interface ViewerArgs {
  json: string;
  buttons: ToolbarButtonsSettings;
  downloadMode: DownloadMode;
}

const sample = JSON.stringify({
  store: 'Example Books',
  open: true,
  items: [
    { name: 'Dune', author: 'Frank Herbert', price: 9.99, tags: ['sci-fi', 'classic'] },
    { name: 'Neuromancer', author: 'William Gibson', price: 7.5, tags: ['cyberpunk'] },
    { name: 'Hyperion', author: 'Dan Simmons', price: 8.25, tags: [] },
  ],
  contact: { email: 'books@example.com', site: 'https://example.com/books' },
});

const createErrorNode = (header: string, ...lines: string[]) => {
  const node = document.createElement('mjf-error-node');
  node.header = header;
  node.lines = lines;
  return node;
};

const prepareResponse = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error'
    ? createErrorNode('Invalid JSON file.', response.error)
    : buildDom(response);
};

const renderViewer = ({ json, buttons, downloadMode }: ViewerArgs) => {
  const page = createElement({ element: 'div' });

  const container = document.createElement('mjf-container');
  container.setRawContent(createElement({ element: 'pre', content: json }));

  const toolbox = document.createElement('mjf-toolbox');
  toolbox.buttons = buttons;
  toolbox.downloadMode = downloadMode;

  const panel = document.createElement('mjf-sticky-panel');
  panel.appendChild(toolbox);

  const wrapper = async <T>(promise: Promise<T>): Promise<T> => {
    try {
      container.startLoading();
      return await promise;
    } finally {
      container.stopLoading();
    }
  };

  const jqQuery = async (query: string) => {
    toolbox.error = null;
    try {
      container.setQueryContent(prepareResponse(await jq(json, query)));
      await pushHistory(extractDomainKey(globalThis.location.href), query);
    } catch (error: unknown) {
      if (isErrorNode(error)) {
        if (error.scope === 'jq') {
          toolbox.error = error.error;
          return;
        }

        container.message(`Error ${error.error} in ${error.scope}`, error.stack ? `Stack trace: ${error.stack}` : '');
        return;
      }

      console.error(error);
    }
  };

  toolbox.addEventListener('tab-changed', event => {
    action('tab-changed')(event.detail);
    container.type = event.detail;
  });

  toolbox.addEventListener('jq-query', async event => {
    action('jq-query')(event.detail);
    await wrapper(jqQuery(event.detail));
  });

  toolbox.addEventListener('download', async event => {
    action('download')(event.detail);
    const suffix = event.detail === 'raw' ? '' : `_${event.detail}`;
    try {
      await download(event.detail, json, `response${suffix}.json`);
    } catch (error: unknown) {
      container.message('Unable to download file', isErrorNode(error) ? error.error : String(error));
    }
  });

  void wrapper(tokenize(json))
    .then(response => container.setFormattedContent(prepareResponse(response)))
    .catch((error: unknown) => container.setError(error));

  page.append(container, panel);
  return page;
};

const runQuery = (query: string): Story['play'] => async ({ canvasElement }) => {
  const toolbox = canvasElement.querySelector('mjf-toolbox');
  toolbox?.shadowRoot?.querySelector<HTMLButtonElement>('button[data-type="query"]')?.click();
  await toolbox?.updateComplete;

  const queryInput = toolbox?.shadowRoot?.querySelector('mjf-query-input');
  await queryInput?.updateComplete;

  const input = queryInput?.shadowRoot?.querySelector('input');
  if (input) {
    input.value = query;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  }
};

const meta = {
  title: 'Content Script/Viewer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The whole JSON page as the content script assembles it, backed by the real WASM tokenizer and jq engine.',
      },
    },
  },
  render: renderViewer,
  decorators: [withContainer({ minHeight: '400px' })],
  argTypes: {
    downloadMode: {
      control: { type: 'select' },
      options: ['dropdown', 'raw', 'formatted', 'minified'] satisfies DownloadMode[],
    },
    json: { control: 'text' },
  },
  args: {
    json: sample,
    buttons: DEFAULT_SETTINGS.buttons,
    downloadMode: 'dropdown',
  },
} satisfies Meta<ViewerArgs>;

export default meta;
type Story = StoryObj<ViewerArgs>;

export const Default: Story = {};

export const QueryResults: Story = {
  play: runQuery('.items[] | .name'),
};

export const QuerySingleResult: Story = {
  play: runQuery('.contact'),
};

export const QueryError: Story = {
  play: runQuery('.items | unknown_function'),
};

export const DirectDownload: Story = {
  args: { downloadMode: 'minified' },
};

export const WithoutQuery: Story = {
  args: {
    buttons: { ...DEFAULT_SETTINGS.buttons, query: false },
  },
};

export const FormattedOnly: Story = {
  args: {
    buttons: { query: false, formatted: true, raw: false, download: false },
  },
};
