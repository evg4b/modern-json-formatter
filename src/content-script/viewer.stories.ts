import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { tokenize } from '@core/background';
import { createElement } from '@core/dom';
import { DEFAULT_SETTINGS, type DownloadMode, type ToolbarButtonsSettings } from '@core/settings';
import { withContainer } from '@testing/storybook';
import { createToolbar, prepareResponse, withLoading } from './extension';
import './ui/container';

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

const renderViewer = ({ json, buttons, downloadMode }: ViewerArgs) => {
  const container = document.createElement('mjf-container');
  container.setRawContent(createElement({ element: 'pre', content: json }));

  const panel = createToolbar(container, () => json, { buttons, downloadMode });
  ['tab-changed', 'jq-query', 'download'].forEach(event => {
    panel.querySelector('mjf-toolbox')?.addEventListener(event, action(event));
  });

  void withLoading(container, tokenize(json))
    .then(response => container.setFormattedContent(prepareResponse(response)))
    .catch((error: unknown) => container.setError(error));

  const page = createElement({ element: 'div' });
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
