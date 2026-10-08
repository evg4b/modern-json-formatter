import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { html } from 'lit';
import './rounded-button';

interface RoundedButtonArgs {
  label: string;
}

const meta = {
  title: 'Core/RoundedButton',
  render: ({ label }) => html`
    <mjf-rounded-button @click=${action('click')}>${label}</mjf-rounded-button>
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

export const Group: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <mjf-rounded-button @click=${action('save')}>Save</mjf-rounded-button>
      <mjf-rounded-button @click=${action('clear')}>Clear</mjf-rounded-button>
      <mjf-rounded-button @click=${action('cancel')}>Cancel</mjf-rounded-button>
    </div>
  `,
};
