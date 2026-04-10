import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './file-size-section';
import { DEFAULT_MAX_FILE_SIZE_MB, MAX_FILE_SIZE_MB, MIN_FILE_SIZE_MB } from '@core/settings';

interface FileSizeSectionArgs {
  maxFileSize: number;
}

const meta = {
  title: 'Options/FileSizeSection',
  render: ({ maxFileSize }) => html`
    <mjf-file-size-section max-file-size=${maxFileSize}></mjf-file-size-section>
  `,
  argTypes: {
    maxFileSize: {
      control: { type: 'range', min: MIN_FILE_SIZE_MB, max: MAX_FILE_SIZE_MB, step: 1 },
    },
  },
  args: {
    maxFileSize: DEFAULT_MAX_FILE_SIZE_MB,
  },
} satisfies Meta<FileSizeSectionArgs>;

export default meta;
type Story = StoryObj<FileSizeSectionArgs>;

export const Default: Story = {};

export const MinSize: Story = {
  args: { maxFileSize: MIN_FILE_SIZE_MB },
};

export const MaxSize: Story = {
  args: { maxFileSize: MAX_FILE_SIZE_MB },
};
