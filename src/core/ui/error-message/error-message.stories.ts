import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './error-message';

interface ErrorMessageArgs {
  message: string;
  small: boolean;
}

const meta = {
  title: 'Core/ErrorMessage',
  tags: ['autodocs'],
  render: ({ message, small }) => html`
    <mjf-error-message ?small=${small}>${message}</mjf-error-message>
  `,
  argTypes: {
    small: { control: 'boolean' },
  },
  args: {
    message: 'Something went wrong',
    small: false,
  },
} satisfies Meta<ErrorMessageArgs>;

export default meta;
type Story = StoryObj<ErrorMessageArgs>;

export const Default: Story = {};

export const Small: Story = {
  args: { small: true },
};

export const LongMessage: Story = {
  args: {
    message: 'Failed to parse JSON: Unexpected token at position 42',
  },
};
