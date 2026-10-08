import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import './toolbar-buttons-section';
import type { ToolbarButtonsSettings } from '@core/settings';

interface ToolbarButtonsSectionArgs {
  buttons: ToolbarButtonsSettings;
}

const meta = {
  title: 'Options/ToolbarButtonsSection',
  component: 'mjf-toolbar-buttons-section',
  parameters: {
    events: ['buttons-change'],
  },
  args: {
    buttons: {
      query: true,
      formatted: true,
      raw: true,
      download: true,
    },
  },
} satisfies Meta<ToolbarButtonsSectionArgs>;

export default meta;
type Story = StoryObj<ToolbarButtonsSectionArgs>;

export const AllEnabled: Story = {};

export const DownloadOnly: Story = {
  args: {
    buttons: {
      query: false,
      formatted: true,
      raw: false,
      download: true,
    },
  },
};

export const NoneEnabled: Story = {
  args: {
    buttons: {
      query: false,
      formatted: true,
      raw: false,
      download: false,
    },
  },
};

export const ViewTabsOnly: Story = {
  args: {
    buttons: {
      query: false,
      formatted: true,
      raw: true,
      download: false,
    },
  },
};

export const QueryAndDownload: Story = {
  args: {
    buttons: {
      query: true,
      formatted: true,
      raw: false,
      download: true,
    },
  },
};
