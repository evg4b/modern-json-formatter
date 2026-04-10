import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './error-node';

interface ErrorNodeArgs {
  header: string;
  lines: string[];
}

const meta = {
  title: 'Content Script/ErrorNode',
  render: ({ header, lines }) => html`
    <mjf-error-node
      header=${header}
      .lines=${lines}
    ></mjf-error-node>
  `,
  args: {
    header: 'Invalid JSON',
    lines: ['Unexpected token at position 42', 'Expected "}" but got ","'],
  },
} satisfies Meta<ErrorNodeArgs>;

export default meta;
type Story = StoryObj<ErrorNodeArgs>;

export const Default: Story = {};

export const SingleLine: Story = {
  args: {
    header: 'Parse error',
    lines: ['Unexpected end of input'],
  },
};

export const NoDetails: Story = {
  args: {
    header: 'Empty response',
    lines: [],
  },
};
