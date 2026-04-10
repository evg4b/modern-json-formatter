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
