import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './example-table';

interface ExampleTableArgs {
  query: string;
  input: string;
  output: string;
}

const meta = {
  title: 'FAQ/ExampleTable',
  render: ({ query, input, output }) => html`
    <mjf-example-table
      query=${query}
      input=${input}
      output=${output}
    ></mjf-example-table>
  `,
  args: {
    query: '.name',
    input: '{"name": "Alice", "age": 30}',
    output: '"Alice"',
  },
} satisfies Meta<ExampleTableArgs>;

export default meta;
type Story = StoryObj<ExampleTableArgs>;

export const Default: Story = {};

export const ArrayQuery: Story = {
  args: {
    query: '.[] | .name',
    input: '[{"name":"Alice"},{"name":"Bob"}]',
    output: '"Alice"\n"Bob"',
  },
};

export const FilterQuery: Story = {
  args: {
    query: '.items[] | select(.active)',
    input: '{"items":[{"id":1,"active":true},{"id":2,"active":false}]}',
    output: '{"id":1,"active":true}',
  },
};
