import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './floating-message';
import type { FloatingMessageType } from './floating-message';

interface FloatingMessageArgs {
  type: FloatingMessageType;
  header: string;
  message: string;
}

const meta = {
  title: 'Core/FloatingMessage',
  render: ({ type, header, message }) => html`
    <div style="position: relative; height: 120px;">
      <mjf-floating-message type=${type} header=${header}>
        ${message}
      </mjf-floating-message>
    </div>
  `,
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
    message: 'The operation completed successfully.',
  },
} satisfies Meta<FloatingMessageArgs>;

export default meta;
type Story = StoryObj<FloatingMessageArgs>;

export const Info: Story = {};

export const ErrorMessage: Story = {
  args: {
    type: 'error-message',
    header: 'Error',
    message: 'Failed to parse JSON content.',
  },
};

export const LongMessage: Story = {
  args: {
    header: 'File is too large',
    message: 'File is too large to be processed (More than 10MB). It has been formatted instead. '
      + 'Increase the maximum file size on the options page to enable the full viewer.',
  },
};

export const WithoutHeader: Story = {
  args: {
    header: '',
    message: 'Copied to clipboard.',
  },
};

export const ErrorWithStackTrace: Story = {
  args: {
    type: 'error-message',
    header: 'Error RuntimeError: unreachable in worker',
    message: 'Stack trace: RuntimeError: unreachable at worker_core.wasm:0x1f2a3 at tokenize (worker.js:12:7)',
  },
};
