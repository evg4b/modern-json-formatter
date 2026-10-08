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
  decorators: [withContainer({ position: 'relative', height: '120px' })],
  parameters: {
    docs: {
      description: {
        component: 'Toast shown at the bottom of the page. It slides in, hides itself after 10 seconds '
          + 'or when the cross is clicked, then removes itself from the DOM — re-render the story to see it again.',
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

export const ErrorWithStackTrace: Story = {
  args: {
    type: 'error-message',
    header: 'Error RuntimeError: unreachable in worker',
    children: 'Stack trace: RuntimeError: unreachable at worker_core.wasm:0x1f2a3 at tokenize (worker.js:12:7)',
  },
};
