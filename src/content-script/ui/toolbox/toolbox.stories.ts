import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import { withContainer } from '@testing/storybook';
import '@core/ui/sticky-panel';
import './toolbox';
import type { DownloadMode, ToolbarButtonsSettings } from '@core/settings';

interface ToolboxArgs {
  tab: TabType;
  error: string | null;
  buttons: ToolbarButtonsSettings;
  downloadMode: DownloadMode;
}

const allButtons: ToolbarButtonsSettings = {
  query: true,
  formatted: true,
  raw: true,
  download: true,
};

const meta = {
  title: 'Content Script/Toolbox',
  // `buttons.formatted` is always on: the options page has no switch for it.
  component: 'mjf-toolbox',
  parameters: {
    events: ['tab-changed', 'download', 'jq-query'],
  },
  argTypes: {
    tab: {
      control: { type: 'select' },
      options: ['formatted', 'raw', 'query'] satisfies TabType[],
    },
    downloadMode: {
      control: { type: 'select' },
      options: ['dropdown', 'raw', 'formatted', 'minified'] satisfies DownloadMode[],
    },
    error: { control: 'text' },
  },
  args: {
    tab: 'formatted',
    error: null,
    buttons: allButtons,
    downloadMode: 'dropdown',
  },
} satisfies Meta<ToolboxArgs>;

export default meta;
type Story = StoryObj<ToolboxArgs>;

export const Formatted: Story = {};

export const Raw: Story = {
  args: { tab: 'raw' },
};

export const Query: Story = {
  args: { tab: 'query' },
};

export const QueryWithError: Story = {
  args: {
    tab: 'query',
    error: 'Unexpected token in jq expression',
  },
};

export const NoDownload: Story = {
  args: {
    buttons: { ...allButtons, download: false },
  },
};

export const DirectDownload: Story = {
  args: {
    downloadMode: 'formatted',
  },
};

export const DirectDownloadRaw: Story = {
  args: {
    downloadMode: 'raw',
  },
};

export const DirectDownloadMinified: Story = {
  args: {
    downloadMode: 'minified',
  },
};

export const TwoTabs: Story = {
  args: {
    buttons: { ...allButtons, query: false },
  },
};

export const SingleTabHidesSwitcher: Story = {
  args: {
    tab: 'formatted',
    buttons: { query: false, formatted: true, raw: false, download: true },
  },
};

export const QueryAndFormatted: Story = {
  args: {
    tab: 'query',
    buttons: { query: true, formatted: true, raw: false, download: false },
  },
};

export const NothingVisible: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Query, Raw and Download turned off: a single tab needs no switcher, so the toolbox is empty.',
      },
    },
  },
  args: {
    buttons: { query: false, formatted: true, raw: false, download: false },
  },
};

export const DownloadMenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const toolbox = canvasElement.querySelector('mjf-toolbox');
    await toolbox?.updateComplete;
    toolbox?.shadowRoot?.querySelector<HTMLButtonElement>('button[title="Download"]')?.click();
  },
};

export const InStickyPanel: Story = {
  decorators: [
    story => html`<mjf-sticky-panel position="rightTop">${story()}</mjf-sticky-panel>`,
    withContainer({ height: '200px', border: '1px dashed #666' }),
  ],
};
