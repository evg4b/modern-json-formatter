import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './download-mode-section';
import type { DownloadMode } from '@core/settings';

interface DownloadModeSectionArgs {
  mode: DownloadMode;
  disabled: boolean;
}

const meta = {
  title: 'Options/DownloadModeSection',
  render: ({ mode, disabled }) => html`
    <mjf-download-mode-section
      mode=${mode}
      ?disabled=${disabled}
    ></mjf-download-mode-section>
  `,
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['dropdown', 'raw', 'formatted', 'minified'] satisfies DownloadMode[],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    mode: 'dropdown',
    disabled: false,
  },
} satisfies Meta<DownloadModeSectionArgs>;

export default meta;
type Story = StoryObj<DownloadModeSectionArgs>;

export const Dropdown: Story = {};

export const DirectRaw: Story = {
  args: { mode: 'raw' },
};

export const DirectFormatted: Story = {
  args: { mode: 'formatted' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
