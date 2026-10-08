import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { type ChildrenArgs, withContainer } from '@testing/storybook';
import './floating-message';
import type { FloatingMessageType } from './floating-message';

interface FloatingMessageArgs extends ChildrenArgs {
  type: FloatingMessageType;
  header: string;
}

const meta = {
  title: 'Core/FloatingMessage',
  component: 'mjf-floating-message',
  decorators: [withContainer({ height: '160px' })],
  parameters: {
    docs: {
      description: {
        component: 'Toast pinned to the bottom-right corner. It slides in, hides itself after 10 seconds '
          + 'or when the cross is clicked, then removes itself from the DOM — re-render the story to see it again. '
          + 'The extension creates every toast as `info-message`, including errors.',
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['info-message', 'error-message'] satisfies FloatingMessageType[],
    },
  },
  args: {
    type: 'info-message',
    header: 'Notification',
    children: 'The operation completed successfully.',
  },
} satisfies Meta<FloatingMessageArgs>;

export default meta;
type Story = StoryObj<FloatingMessageArgs>;

export const Info: Story = {};

export const ErrorMessage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Supported by the component but not currently used by the extension.',
      },
    },
  },
  args: {
    type: 'error-message',
    header: 'Error',
    children: 'Failed to parse JSON content.',
  },
};

export const LongMessage: Story = {
  args: {
    header: 'File is too large',
    children: 'File is too large to be processed (More than 10MB). It has been formatted instead. '
      + 'Increase the maximum file size on the options page to enable the full viewer.',
  },
};

export const WithoutHeader: Story = {
  args: {
    header: '',
    children: 'Copied to clipboard.',
  },
};

export const WorkerError: Story = {
  args: {
    header: 'Error RuntimeError: unreachable in worker',
    children: 'Stack trace: RuntimeError: unreachable at worker_core.wasm:0x1f2a3 at tokenize (worker.js:12:7)',
  },
};

export const DownloadFailed: Story = {
  args: {
    header: 'Unable to download file',
    children: 'Download blocked by the browser.',
  },
};
