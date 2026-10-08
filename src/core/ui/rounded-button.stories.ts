import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { html } from 'lit';
import type { ChildrenArgs } from '@testing/storybook';
import './rounded-button';

const meta = {
  title: 'Core/RoundedButton',
  component: 'mjf-rounded-button',
  parameters: {
    events: ['click'],
  },
  args: {
    children: 'Click me',
  },
} satisfies Meta<ChildrenArgs>;

export default meta;
type Story = StoryObj<ChildrenArgs>;

export const Default: Story = {};

export const LongLabel: Story = {
  args: { children: 'Download as JSON' },
};

export const ShortLabel: Story = {
  args: { children: 'OK' },
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
