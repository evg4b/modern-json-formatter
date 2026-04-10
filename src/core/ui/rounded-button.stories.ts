import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './rounded-button';

interface RoundedButtonArgs {
  label: string;
}

const meta = {
  title: 'Core/RoundedButton',
  render: ({ label }) => html`
    <mjf-rounded-button>${label}</mjf-rounded-button>
  `,
  args: {
    label: 'Click me',
  },
} satisfies Meta<RoundedButtonArgs>;

export default meta;
type Story = StoryObj<RoundedButtonArgs>;

export const Default: Story = {};

export const LongLabel: Story = {
  args: { label: 'Download as JSON' },
};

export const ShortLabel: Story = {
  args: { label: 'OK' },
};
