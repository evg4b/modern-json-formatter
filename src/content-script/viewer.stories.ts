import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { createElement } from '@core/dom';
import { DEFAULT_SETTINGS, type DownloadMode, type ToolbarButtonsSettings } from '@core/settings';
import { fakeJq } from '@testing/storybook/chrome.mock';
import { toTokens } from '@testing/storybook/tokens';
import { buildDom } from './dom';
import { isErrorNode } from './helpers';
import './ui/container/container';
import './ui/error-node';
import './ui/toolbox';
import '@core/ui/sticky-panel';

interface ViewerArgs {
  json: unknown;
  initialQuery: string;
  buttons: ToolbarButtonsSettings;
  downloadMode: DownloadMode;
}

const sample = {
  store: 'Example Books',
  open: true,
  items: [
    { name: 'Dune', author: 'Frank Herbert', price: 9.99, tags: ['sci-fi', 'classic'] },
    { name: 'Neuromancer', author: 'William Gibson', price: 7.5, tags: ['cyberpunk'] },
    { name: 'Hyperion', author: 'Dan Simmons', price: 8.25, tags: [] },
  ],
  contact: { email: 'books@example.com', site: 'https://example.com/books' },
};

const createErrorNode = (header: string, ...lines: string[]) => {
  const node = document.createElement('mjf-error-node');
  node.header = header;
  node.lines = lines;
  return node;
};

/**
 * Mirrors the wiring in `extension.ts` without the background worker:
 * the toolbox switches tabs, runs queries through a small jq subset and logs downloads.
 */
const renderViewer = ({ json, buttons, downloadMode, initialQuery }: ViewerArgs) => {
  const raw = JSON.stringify(json);
  const page = createElement({ element: 'div', class: 'viewer' });
  page.style.position = 'relative';
  page.style.minHeight = '100vh';

  const container = document.createElement('mjf-container');
  container.setRawContent(createElement({ element: 'pre', content: raw }));
  container.setFormattedContent(buildDom(toTokens(json)));

  const toolbox = document.createElement('mjf-toolbox');
  toolbox.buttons = buttons;
  toolbox.downloadMode = downloadMode;

  const panel = document.createElement('mjf-sticky-panel');
  panel.appendChild(toolbox);

  const runQuery = (query: string) => {
    toolbox.error = null;
    try {
      const response = fakeJq(raw, query);
      container.setQueryContent(buildDom(response));
    } catch (error: unknown) {
      if (isErrorNode(error)) {
        toolbox.error = error.error;
        return;
      }

      container.setQueryContent(createErrorNode('Query failed', String(error)));
    }
  };

  toolbox.addEventListener('tab-changed', event => {
    action('tab-changed')(event.detail);
    container.type = event.detail;
  });

  toolbox.addEventListener('jq-query', event => {
    action('jq-query')(event.detail);
    runQuery(event.detail);
  });

  toolbox.addEventListener('download', event => {
    action('download')(event.detail);
    container.message('Download', `A real extension would now save the ${event.detail} file.`);
  });

  if (initialQuery) {
    toolbox.tab = 'query';
    container.type = 'query';
    runQuery(initialQuery);
  }

  page.append(container, panel);
  return page;
};

const meta = {
  title: 'Content Script/Viewer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The whole JSON page as the content script assembles it. '
          + 'Queries are evaluated by a small jq subset (`.a.b`, `.[0]`, `.[]`, `keys`, `length`, pipes).',
      },
    },
  },
  render: renderViewer,
  argTypes: {
    downloadMode: {
      control: { type: 'select' },
      options: ['dropdown', 'raw', 'formatted', 'minified'] satisfies DownloadMode[],
    },
    initialQuery: { control: 'text' },
    json: { control: 'object' },
  },
  args: {
    json: sample,
    initialQuery: '',
    buttons: DEFAULT_SETTINGS.buttons,
    downloadMode: 'dropdown',
  },
} satisfies Meta<ViewerArgs>;

export default meta;
type Story = StoryObj<ViewerArgs>;

export const Default: Story = {};

export const QueryResult: Story = {
  args: { initialQuery: '.items[] | .name' },
};

export const QuerySingleValue: Story = {
  args: { initialQuery: '.contact' },
};

export const QueryError: Story = {
  args: { initialQuery: 'unknown_function' },
};

export const DirectDownload: Story = {
  args: { downloadMode: 'minified' },
};

export const WithoutQuery: Story = {
  args: {
    buttons: { query: false, formatted: true, raw: true, download: true },
  },
};

export const DownloadOnly: Story = {
  args: {
    buttons: { query: false, formatted: false, raw: false, download: true },
  },
};
