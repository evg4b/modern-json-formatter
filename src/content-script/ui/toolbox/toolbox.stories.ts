import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
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
  render: ({ tab, error, buttons, downloadMode }) => html`
    <mjf-toolbox
      tab=${tab}
      .error=${error}
      .buttons=${buttons}
      download-mode=${downloadMode}
    ></mjf-toolbox>
  `,
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
