import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './toolbar-buttons-section';
import type { ToolbarButtonsSettings } from '@core/settings';

interface ToolbarButtonsSectionArgs {
  buttons: ToolbarButtonsSettings;
}

const meta = {
  title: 'Options/ToolbarButtonsSection',
  render: ({ buttons }) => html`
    <mjf-toolbar-buttons-section .buttons=${buttons}></mjf-toolbar-buttons-section>
  `,
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
      formatted: false,
      raw: false,
      download: true,
    },
  },
};

export const NoneEnabled: Story = {
  args: {
    buttons: {
      query: false,
      formatted: false,
      raw: false,
      download: false,
    },
  },
};
