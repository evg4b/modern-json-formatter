import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './query-input';

interface QueryInputArgs {
  error: string | null;
}

const meta = {
  title: 'Content Script/QueryInput',
  render: ({ error }) => html`
    <mjf-query-input .error=${error}></mjf-query-input>
  `,
  argTypes: {
    error: { control: 'text' },
  },
  args: {
    error: null,
  },
} satisfies Meta<QueryInputArgs>;

export default meta;
type Story = StoryObj<QueryInputArgs>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: 'Unexpected token in jq expression',
  },
};
